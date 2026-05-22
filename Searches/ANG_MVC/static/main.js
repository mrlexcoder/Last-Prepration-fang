/* AuroraNeuroGrid — ChatGPT-style frontend */

// ── State ──────────────────────────────────────────────────────────────
let currentMode = 'chat';
let sessions = [];          // [{id, title, messages:[]}]
let activeSession = null;

// ── DOM refs ───────────────────────────────────────────────────────────
const sidebar       = document.getElementById('sidebar');
const toggleBtn     = document.getElementById('toggleSidebar');
const newChatBtn    = document.getElementById('newChatBtn');
const chatHistory   = document.getElementById('chatHistory');
const modelSelect   = document.getElementById('modelSelect');
const modelBadge    = document.getElementById('modelBadge');
const modeTabs      = document.getElementById('modeTabs');
const chatWindow    = document.getElementById('chatWindow');
const welcome       = document.getElementById('welcome');
const messagesEl    = document.getElementById('messages');
const inputBox      = document.getElementById('inputBox');
const sendBtn       = document.getElementById('sendBtn');
const extraOpts     = document.getElementById('extraOpts');
const modeLabel     = document.getElementById('modeLabel');
const runtimeLabel  = document.getElementById('runtimeLabel');
const agiBtn        = document.getElementById('agiBtn');
const cacheBtn      = document.getElementById('cacheBtn');

// ── Init ───────────────────────────────────────────────────────────────
newSession();
// Sync badge/label with default selected model
modelBadge.textContent = modelSelect.options[modelSelect.selectedIndex].text;
runtimeLabel.innerHTML = `Runtime: <b>${modelSelect.value}</b>`;

// ── Session management ─────────────────────────────────────────────────
function newSession() {
  const id = Date.now();
  const session = { id, title: 'New chat', messages: [] };
  sessions.unshift(session);
  activeSession = session;
  renderHistory();
  clearMessages();
}

function loadSession(id) {
  activeSession = sessions.find(s => s.id === id);
  renderHistory();
  clearMessages();
  activeSession.messages.forEach(m => appendBubble(m.role, m.content, m.meta, false));
  if (activeSession.messages.length) hideWelcome();
}

function renderHistory() {
  chatHistory.innerHTML = '';
  sessions.forEach(s => {
    const el = document.createElement('div');
    el.className = 'history-item' + (s.id === activeSession.id ? ' active' : '');
    el.textContent = s.title;
    el.onclick = () => loadSession(s.id);
    chatHistory.appendChild(el);
  });
}

function clearMessages() {
  messagesEl.innerHTML = '';
  welcome.style.display = 'flex';
  messagesEl.style.display = 'none';
}

function hideWelcome() {
  welcome.style.display = 'none';
  messagesEl.style.display = 'flex';
}

// ── Mode tabs ──────────────────────────────────────────────────────────
modeTabs.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    modeTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentMode = tab.dataset.mode;
    modeLabel.innerHTML = `Mode: <b>${currentMode}</b>`;
    extraOpts.style.display = (currentMode === 'loop' || currentMode === 'pipeline') ? 'flex' : 'none';
  });
});

// ── Model select ───────────────────────────────────────────────────────
modelSelect.addEventListener('change', () => {
  modelBadge.textContent = modelSelect.options[modelSelect.selectedIndex].text;
  runtimeLabel.innerHTML = `Runtime: <b>${modelSelect.value}</b>`;
});

// ── Sidebar toggle ─────────────────────────────────────────────────────
toggleBtn.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
newChatBtn.addEventListener('click', newSession);

// ── Welcome chips ──────────────────────────────────────────────────────
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    inputBox.value = chip.dataset.prompt;
    send();
  });
});

// ── Auto-resize textarea ───────────────────────────────────────────────
inputBox.addEventListener('input', () => {
  inputBox.style.height = 'auto';
  inputBox.style.height = Math.min(inputBox.scrollHeight, 200) + 'px';
});

inputBox.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
});

sendBtn.addEventListener('click', send);

// ── AGI / Cache buttons ────────────────────────────────────────────────
agiBtn.addEventListener('click', async () => {
  const data = await getJson('/admin/agi-status');
  appendBubble('bot', null, null, true, data, '🧠 AGI Status');
});
cacheBtn.addEventListener('click', async () => {
  const data = await getJson('/admin/cache-stats');
  appendBubble('bot', null, null, true, data, '💾 Cache Stats');
});

// ── Send ───────────────────────────────────────────────────────────────
async function send() {
  const text = inputBox.value.trim();
  if (!text) return;

  hideWelcome();
  inputBox.value = '';
  inputBox.style.height = 'auto';
  sendBtn.disabled = true;

  // User bubble
  appendBubble('user', text);
  activeSession.messages.push({ role: 'user', content: text });
  if (activeSession.title === 'New chat') {
    activeSession.title = text.slice(0, 40);
    renderHistory();
  }

  // Typing indicator
  const typingId = appendTyping();

  try {
    const result = await callApi(text);
    removeTyping(typingId);
    const output = formatOutput(result);
    const meta = buildMeta(result);
    appendBubble('bot', output, meta);
    activeSession.messages.push({ role: 'bot', content: output, meta });
  } catch (err) {
    removeTyping(typingId);
    appendBubble('bot', `⚠️ ${err.message}`);
  }

  sendBtn.disabled = false;
  scrollBottom();
}

// ── API calls ──────────────────────────────────────────────────────────
async function callApi(text) {
  // null means "auto-select" (quantum router picks lowest latency)
  const hint = modelSelect.value === 'runtime_adapter_stub' ? null : modelSelect.value;

  if (currentMode === 'chat' || currentMode === 'search') {
    return postJson('/api/bridge', { mode: currentMode, input: text, runtime_hint: hint });
  }
  if (currentMode === 'loop') {
    return postJson('/api/loop', {
      input: text,
      max_iterations: Number(document.getElementById('maxIter').value),
      confidence_threshold: Number(document.getElementById('confThresh').value),
      runtime_hint: hint,
    });
  }
  if (currentMode === 'pipeline') {
    const raw = document.getElementById('pipeSteps').value.trim();
    const steps = raw ? raw.split(',').map(s => s.trim()) : [text];
    return postJson('/api/bridge', { mode: 'pipeline', input: text, steps, runtime_hint: hint });
  }
  if (currentMode === 'tools') {
    return postJson('/api/bridge', {
      mode: 'tools', input: text,
      tools: ['web_search', 'calculator', 'code_executor', 'memory_lookup'],
      runtime_hint: hint,
    });
  }
  // Single Infer mode
  return postJson('/api/infer', { input: text, latency_budget_ms: 200, runtime_hint: hint });
}

async function postJson(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

async function getJson(url) {
  const r = await fetch(url);
  return r.json();
}

// ── Output formatting ──────────────────────────────────────────────────
function formatOutput(result) {
  // Extract the main text output from any response shape
  if (result.output) return result.output;
  if (result.final_output) return result.final_output;
  if (result.pipeline) return result.final_output || JSON.stringify(result, null, 2);
  return JSON.stringify(result, null, 2);
}

function buildMeta(result) {
  const parts = [];
  // provider comes from result.runtime (bridge) or result.meta.provider (infer)
  const provider = result.runtime || result.meta?.provider;
  if (provider) parts.push({ icon: '⚙️', text: provider });
  if (result.confidence != null) parts.push({ icon: '📊', text: `conf ${(result.confidence * 100).toFixed(0)}%` });
  if (result.meta?.latency_ms) parts.push({ icon: '⚡', text: `${result.meta.latency_ms}ms` });
  if (result.iterations) parts.push({ icon: '🔁', text: `${result.iterations} iter` });
  if (result.sources?.length) parts.push({ icon: '📚', text: `${result.sources.length} sources` });
  if (result.called_tool) parts.push({ icon: '🔧', text: result.called_tool });
  return parts;
}

// ── DOM helpers ────────────────────────────────────────────────────────
function appendBubble(role, text, meta = [], scroll = true, jsonData = null, jsonTitle = '') {
  const msg = document.createElement('div');
  msg.className = `msg ${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'user' ? 'U' : '⬡';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  if (text) {
    const p = document.createElement('p');
    p.textContent = text;
    bubble.appendChild(p);
  }

  if (jsonData) {
    if (jsonTitle) {
      const t = document.createElement('p');
      t.style.fontWeight = '600';
      t.style.marginBottom = '6px';
      t.textContent = jsonTitle;
      bubble.appendChild(t);
    }
    const pre = document.createElement('div');
    pre.className = 'json-block';
    pre.textContent = JSON.stringify(jsonData, null, 2);
    bubble.appendChild(pre);
  }

  if (meta && meta.length) {
    const metaLine = document.createElement('div');
    metaLine.className = 'meta-line';
    meta.forEach(m => {
      const s = document.createElement('span');
      s.textContent = `${m.icon} ${m.text}`;
      metaLine.appendChild(s);
    });
    bubble.appendChild(metaLine);
  }

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  messagesEl.appendChild(msg);
  if (scroll) scrollBottom();
}

let typingCounter = 0;
function appendTyping() {
  const id = 'typing-' + (++typingCounter);
  const msg = document.createElement('div');
  msg.className = 'msg bot';
  msg.id = id;
  msg.innerHTML = `
    <div class="avatar">⬡</div>
    <div class="bubble">
      <div class="typing"><span></span><span></span><span></span></div>
    </div>`;
  messagesEl.appendChild(msg);
  scrollBottom();
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
