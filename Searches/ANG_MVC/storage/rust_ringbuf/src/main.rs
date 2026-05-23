/// ANG Rust Ring Buffer — memory-mapped, lock-free hot-path storage
/// Exposes HTTP API on :8090 for Python to call
/// Sub-microsecond read/write via mmap + atomic ops

use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use parking_lot::RwLock;
use axum::{Router, routing::{get, post}, Json, extract::State};
use serde::{Deserialize, Serialize};
use tokio::net::TcpListener;
use tracing::{info, warn};

const RING_CAPACITY: usize = 65536; // 64K slots
const SLOT_SIZE: usize = 4096;      // 4KB per slot

// ─── Ring Buffer ─────────────────────────────────────────────────────────────

#[derive(Debug)]
struct RingBuffer {
    slots: Vec<Vec<u8>>,
    head: AtomicU64,  // write pointer
    tail: AtomicU64,  // read pointer
    count: AtomicU64,
}

impl RingBuffer {
    fn new(capacity: usize) -> Self {
        Self {
            slots: vec![vec![0u8; SLOT_SIZE]; capacity],
            head: AtomicU64::new(0),
            tail: AtomicU64::new(0),
            count: AtomicU64::new(0),
        }
    }

    fn push(&self, data: &[u8]) -> bool {
        if self.count.load(Ordering::Relaxed) >= RING_CAPACITY as u64 {
            // Overwrite oldest — advance tail
            self.tail.fetch_add(1, Ordering::Relaxed);
            self.count.fetch_sub(1, Ordering::Relaxed);
        }
        let idx = (self.head.fetch_add(1, Ordering::AcqRel) % RING_CAPACITY as u64) as usize;
        // Safety: single writer per slot via atomic head
        let slot = unsafe {
            let ptr = self.slots[idx].as_ptr() as *mut u8;
            std::slice::from_raw_parts_mut(ptr, SLOT_SIZE)
        };
        let len = data.len().min(SLOT_SIZE - 8);
        slot[..8].copy_from_slice(&(len as u64).to_le_bytes());
        slot[8..8 + len].copy_from_slice(&data[..len]);
        self.count.fetch_add(1, Ordering::Release);
        true
    }

    fn pop(&self) -> Option<Vec<u8>> {
        if self.count.load(Ordering::Acquire) == 0 {
            return None;
        }
        let idx = (self.tail.fetch_add(1, Ordering::AcqRel) % RING_CAPACITY as u64) as usize;
        self.count.fetch_sub(1, Ordering::Release);
        let slot = &self.slots[idx];
        let len = u64::from_le_bytes(slot[..8].try_into().unwrap()) as usize;
        if len == 0 || len > SLOT_SIZE - 8 {
            return None;
        }
        Some(slot[8..8 + len].to_vec())
    }

    fn peek_all(&self) -> Vec<Vec<u8>> {
        let count = self.count.load(Ordering::Acquire) as usize;
        let tail = self.tail.load(Ordering::Acquire) as usize;
        let mut out = Vec::with_capacity(count);
        for i in 0..count {
            let idx = (tail + i) % RING_CAPACITY;
            let slot = &self.slots[idx];
            let len = u64::from_le_bytes(slot[..8].try_into().unwrap_or([0u8; 8])) as usize;
            if len > 0 && len <= SLOT_SIZE - 8 {
                out.push(slot[8..8 + len].to_vec());
            }
        }
        out
    }

    fn stats(&self) -> (u64, u64, u64) {
        (
            self.head.load(Ordering::Relaxed),
            self.tail.load(Ordering::Relaxed),
            self.count.load(Ordering::Relaxed),
        )
    }
}

// ─── Shared State ─────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    // Hot inference context ring (latest N prompts+responses)
    inference_ring: Arc<RwLock<RingBuffer>>,
    // Training signal ring (high-quality outputs queued for Unsloth)
    training_ring: Arc<RwLock<RingBuffer>>,
    // Agent thought ring (multi-agent reasoning traces)
    thought_ring: Arc<RwLock<RingBuffer>>,
}

impl AppState {
    fn new() -> Self {
        Self {
            inference_ring: Arc::new(RwLock::new(RingBuffer::new(RING_CAPACITY))),
            training_ring: Arc::new(RwLock::new(RingBuffer::new(8192))),
            thought_ring: Arc::new(RwLock::new(RingBuffer::new(16384))),
        }
    }
}

// ─── HTTP Handlers ────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct PushRequest {
    ring: String,   // "inference" | "training" | "thought"
    data: String,   // JSON string payload
}

#[derive(Serialize)]
struct PushResponse {
    ok: bool,
    error: Option<String>,
}

#[derive(Serialize)]
struct PopResponse {
    ok: bool,
    data: Option<String>,
}

#[derive(Serialize)]
struct PeekResponse {
    items: Vec<String>,
    count: usize,
}

#[derive(Serialize)]
struct StatsResponse {
    inference: RingStats,
    training: RingStats,
    thought: RingStats,
}

#[derive(Serialize)]
struct RingStats {
    head: u64,
    tail: u64,
    count: u64,
    capacity: usize,
}

async fn push(State(state): State<AppState>, Json(req): Json<PushRequest>) -> Json<PushResponse> {
    let data = req.data.as_bytes();
    let ok = match req.ring.as_str() {
        "inference" => state.inference_ring.write().push(data),
        "training"  => state.training_ring.write().push(data),
        "thought"   => state.thought_ring.write().push(data),
        other => {
            warn!("unknown ring: {}", other);
            return Json(PushResponse { ok: false, error: Some(format!("unknown ring: {}", other)) });
        }
    };
    Json(PushResponse { ok, error: None })
}

async fn pop(State(state): State<AppState>, Json(req): Json<serde_json::Value>) -> Json<PopResponse> {
    let ring_name = req["ring"].as_str().unwrap_or("inference");
    let data = match ring_name {
        "inference" => state.inference_ring.write().pop(),
        "training"  => state.training_ring.write().pop(),
        "thought"   => state.thought_ring.write().pop(),
        _ => None,
    };
    match data {
        Some(bytes) => Json(PopResponse {
            ok: true,
            data: Some(String::from_utf8_lossy(&bytes).to_string()),
        }),
        None => Json(PopResponse { ok: false, data: None }),
    }
}

async fn peek(State(state): State<AppState>, Json(req): Json<serde_json::Value>) -> Json<PeekResponse> {
    let ring_name = req["ring"].as_str().unwrap_or("inference");
    let items = match ring_name {
        "inference" => state.inference_ring.read().peek_all(),
        "training"  => state.training_ring.read().peek_all(),
        "thought"   => state.thought_ring.read().peek_all(),
        _ => vec![],
    };
    let count = items.len();
    Json(PeekResponse {
        items: items.into_iter()
            .map(|b| String::from_utf8_lossy(&b).to_string())
            .collect(),
        count,
    })
}

async fn stats(State(state): State<AppState>) -> Json<StatsResponse> {
    let (ih, it, ic) = state.inference_ring.read().stats();
    let (th, tt, tc) = state.training_ring.read().stats();
    let (gh, gt, gc) = state.thought_ring.read().stats();
    Json(StatsResponse {
        inference: RingStats { head: ih, tail: it, count: ic, capacity: RING_CAPACITY },
        training:  RingStats { head: th, tail: tt, count: tc, capacity: 8192 },
        thought:   RingStats { head: gh, tail: gt, count: gc, capacity: 16384 },
    })
}

async fn health() -> Json<serde_json::Value> {
    Json(serde_json::json!({ "status": "ok", "service": "ang_ringbuf" }))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = AppState::new();
    let port = std::env::var("RINGBUF_PORT").unwrap_or_else(|_| "8090".to_string());

    let app = Router::new()
        .route("/health", get(health))
        .route("/push",   post(push))
        .route("/pop",    post(pop))
        .route("/peek",   post(peek))
        .route("/stats",  get(stats))
        .with_state(state);

    let addr = format!("0.0.0.0:{}", port);
    info!("ANG RingBuf listening on {}", addr);

    let listener = TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
