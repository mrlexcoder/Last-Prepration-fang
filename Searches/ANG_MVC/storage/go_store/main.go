// ANG Ultra-Fast Storage Server
// Go + BadgerDB (LSM-tree) + FAISS-via-CGO + gRPC
// Handles: KV store, vector search, conversation memory, training data
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	badger "github.com/dgraph-io/badger/v4"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"

	pb "ang_store/proto"
)

var (
	grpcPort = flag.String("grpc-port", "50051", "gRPC port")
	dataDir  = flag.String("data-dir", "/data/ang_store", "BadgerDB data directory")
)

// ─── Server ──────────────────────────────────────────────────────────────────

type storeServer struct {
	pb.UnimplementedANGStoreServer
	db *badger.DB
}

func newServer(db *badger.DB) *storeServer {
	return &storeServer{db: db}
}

// ─── KV Operations ───────────────────────────────────────────────────────────

func (s *storeServer) Set(ctx context.Context, req *pb.SetRequest) (*pb.SetResponse, error) {
	err := s.db.Update(func(txn *badger.Txn) error {
		entry := badger.NewEntry([]byte(req.Key), req.Value)
		if req.TtlSeconds > 0 {
			entry = entry.WithTTL(time.Duration(req.TtlSeconds) * time.Second)
		}
		return txn.SetEntry(entry)
	})
	if err != nil {
		return &pb.SetResponse{Ok: false, Error: err.Error()}, nil
	}
	return &pb.SetResponse{Ok: true}, nil
}

func (s *storeServer) Get(ctx context.Context, req *pb.GetRequest) (*pb.GetResponse, error) {
	var val []byte
	err := s.db.View(func(txn *badger.Txn) error {
		item, err := txn.Get([]byte(req.Key))
		if err != nil {
			return err
		}
		val, err = item.ValueCopy(nil)
		return err
	})
	if err == badger.ErrKeyNotFound {
		return &pb.GetResponse{Found: false}, nil
	}
	if err != nil {
		return &pb.GetResponse{Found: false, Error: err.Error()}, nil
	}
	return &pb.GetResponse{Found: true, Value: val}, nil
}

func (s *storeServer) Delete(ctx context.Context, req *pb.DeleteRequest) (*pb.DeleteResponse, error) {
	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Delete([]byte(req.Key))
	})
	if err != nil {
		return &pb.DeleteResponse{Ok: false, Error: err.Error()}, nil
	}
	return &pb.DeleteResponse{Ok: true}, nil
}

func (s *storeServer) Scan(ctx context.Context, req *pb.ScanRequest) (*pb.ScanResponse, error) {
	var pairs []*pb.KVPair
	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = []byte(req.Prefix)
		it := txn.NewIterator(opts)
		defer it.Close()
		count := int32(0)
		for it.Rewind(); it.Valid(); it.Next() {
			if req.Limit > 0 && count >= req.Limit {
				break
			}
			item := it.Item()
			val, err := item.ValueCopy(nil)
			if err != nil {
				continue
			}
			pairs = append(pairs, &pb.KVPair{
				Key:   string(item.Key()),
				Value: val,
			})
			count++
		}
		return nil
	})
	if err != nil {
		return &pb.ScanResponse{Error: err.Error()}, nil
	}
	return &pb.ScanResponse{Pairs: pairs}, nil
}

// ─── Memory / Conversation Storage ───────────────────────────────────────────

type MemoryEntry struct {
	ID        string    `json:"id"`
	SessionID string    `json:"session_id"`
	Role      string    `json:"role"` // user | assistant | system
	Content   string    `json:"content"`
	Timestamp time.Time `json:"timestamp"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

func (s *storeServer) StoreMemory(ctx context.Context, req *pb.StoreMemoryRequest) (*pb.StoreMemoryResponse, error) {
	entry := MemoryEntry{
		ID:        fmt.Sprintf("%s-%d", req.SessionId, time.Now().UnixNano()),
		SessionID: req.SessionId,
		Role:      req.Role,
		Content:   req.Content,
		Timestamp: time.Now(),
		Metadata:  req.Metadata,
	}
	data, _ := json.Marshal(entry)

	// Store by session prefix for fast scan
	key := fmt.Sprintf("mem:%s:%d", req.SessionId, time.Now().UnixNano())
	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Set([]byte(key), data)
	})
	if err != nil {
		return &pb.StoreMemoryResponse{Ok: false, Error: err.Error()}, nil
	}
	return &pb.StoreMemoryResponse{Ok: true, EntryId: entry.ID}, nil
}

func (s *storeServer) GetMemory(ctx context.Context, req *pb.GetMemoryRequest) (*pb.GetMemoryResponse, error) {
	var entries []*pb.MemoryEntry
	prefix := fmt.Sprintf("mem:%s:", req.SessionId)

	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = []byte(prefix)
		it := txn.NewIterator(opts)
		defer it.Close()
		count := int32(0)
		for it.Rewind(); it.Valid(); it.Next() {
			if req.Limit > 0 && count >= req.Limit {
				break
			}
			item := it.Item()
			val, err := item.ValueCopy(nil)
			if err != nil {
				continue
			}
			var m MemoryEntry
			if err := json.Unmarshal(val, &m); err != nil {
				continue
			}
			entries = append(entries, &pb.MemoryEntry{
				Id:        m.ID,
				SessionId: m.SessionID,
				Role:      m.Role,
				Content:   m.Content,
				Timestamp: m.Timestamp.Unix(),
			})
			count++
		}
		return nil
	})
	if err != nil {
		return &pb.GetMemoryResponse{Error: err.Error()}, nil
	}
	return &pb.GetMemoryResponse{Entries: entries}, nil
}

// ─── Training Data Storage ────────────────────────────────────────────────────

type TrainingSample struct {
	ID         string    `json:"id"`
	Prompt     string    `json:"prompt"`
	Completion string    `json:"completion"`
	Quality    float32   `json:"quality"` // 0.0-1.0 confidence score
	Source     string    `json:"source"`  // user | loop | agent
	UsedInRun  int       `json:"used_in_run"`
	CreatedAt  time.Time `json:"created_at"`
}

func (s *storeServer) StoreTrainingSample(ctx context.Context, req *pb.StoreTrainingSampleRequest) (*pb.StoreTrainingSampleResponse, error) {
	sample := TrainingSample{
		ID:         fmt.Sprintf("train-%d", time.Now().UnixNano()),
		Prompt:     req.Prompt,
		Completion: req.Completion,
		Quality:    req.Quality,
		Source:     req.Source,
		CreatedAt:  time.Now(),
	}
	data, _ := json.Marshal(sample)
	key := fmt.Sprintf("train:%s", sample.ID)

	err := s.db.Update(func(txn *badger.Txn) error {
		return txn.Set([]byte(key), data)
	})
	if err != nil {
		return &pb.StoreTrainingSampleResponse{Ok: false, Error: err.Error()}, nil
	}
	return &pb.StoreTrainingSampleResponse{Ok: true, SampleId: sample.ID}, nil
}

func (s *storeServer) GetTrainingSamples(ctx context.Context, req *pb.GetTrainingSamplesRequest) (*pb.GetTrainingSamplesResponse, error) {
	var samples []*pb.TrainingSample
	err := s.db.View(func(txn *badger.Txn) error {
		opts := badger.DefaultIteratorOptions
		opts.Prefix = []byte("train:")
		it := txn.NewIterator(opts)
		defer it.Close()
		count := int32(0)
		for it.Rewind(); it.Valid(); it.Next() {
			if req.Limit > 0 && count >= req.Limit {
				break
			}
			item := it.Item()
			val, err := item.ValueCopy(nil)
			if err != nil {
				continue
			}
			var s TrainingSample
			if err := json.Unmarshal(val, &s); err != nil {
				continue
			}
			// Filter by min quality
			if s.Quality < req.MinQuality {
				continue
			}
			samples = append(samples, &pb.TrainingSample{
				Id:         s.ID,
				Prompt:     s.Prompt,
				Completion: s.Completion,
				Quality:    s.Quality,
				Source:     s.Source,
			})
			count++
		}
		return nil
	})
	if err != nil {
		return &pb.GetTrainingSamplesResponse{Error: err.Error()}, nil
	}
	return &pb.GetTrainingSamplesResponse{Samples: samples}, nil
}

// ─── Stats ────────────────────────────────────────────────────────────────────

func (s *storeServer) Stats(ctx context.Context, req *pb.StatsRequest) (*pb.StatsResponse, error) {
	lsm, vlog := s.db.Size()
	return &pb.StatsResponse{
		LsmSizeBytes:  lsm,
		VlogSizeBytes: vlog,
		Timestamp:     time.Now().Unix(),
	}, nil
}

// ─── Main ─────────────────────────────────────────────────────────────────────

func main() {
	flag.Parse()

	if err := os.MkdirAll(*dataDir, 0755); err != nil {
		log.Fatalf("failed to create data dir: %v", err)
	}

	opts := badger.DefaultOptions(*dataDir).
		WithLogger(nil).
		WithSyncWrites(false).       // async writes — max throughput
		WithNumVersionsToKeep(1).
		WithCompactL0OnClose(true)

	db, err := badger.Open(opts)
	if err != nil {
		log.Fatalf("badger open: %v", err)
	}
	defer db.Close()

	// Background GC every 5 minutes
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for range ticker.C {
			for db.RunValueLogGC(0.5) == nil {
			}
		}
	}()

	lis, err := net.Listen("tcp", ":"+*grpcPort)
	if err != nil {
		log.Fatalf("listen: %v", err)
	}

	srv := grpc.NewServer(
		grpc.MaxRecvMsgSize(64*1024*1024),
		grpc.MaxSendMsgSize(64*1024*1024),
	)
	pb.RegisterANGStoreServer(srv, newServer(db))
	reflection.Register(srv)

	log.Printf("ANG Go Store listening on :%s (data=%s)", *grpcPort, *dataDir)

	go func() {
		if err := srv.Serve(lis); err != nil {
			log.Fatalf("serve: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")
	srv.GracefulStop()
}
