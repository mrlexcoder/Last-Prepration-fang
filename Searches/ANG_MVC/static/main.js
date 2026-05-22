const resultOutput = document.getElementById('resultOutput');

function val(id) { return document.getElementById(id).value.trim(); }
function numVal(id) { return Number(document.getElementById(id).value); }

async function post(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

async function get(url) {
  const r = await fetch(url);
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

function show(data) {
  resultOutput.textContent = JSON.stringify(data, null, 2);
}

document.getElementById('executeBtn').addEventListener('click', async () => {
  const mode = val('modeSelect');
  const input = val('inputText');
  const runtimeHint = val('runtimeHint') || null;
  resultOutput.textContent = `Running [${mode}]...`;

  try {
    let data;
    if (mode === 'infer') {
      data = await post('/api/infer', {
        input,
        latency_budget_ms: numVal('latencyBudget'),
        runtime_hint: runtimeHint,
      });
    } else if (mode === 'loop') {
      data = await post('/api/loop', {
        input,
        max_iterations: numVal('maxIterations'),
        confidence_threshold: numVal('confidenceThreshold'),
        runtime_hint: runtimeHint,
      });
    } else if (mode === 'pipeline') {
      const rawSteps = val('pipelineSteps');
      const steps = rawSteps ? rawSteps.split(',').map(s => s.trim()) : [input];
      data = await post('/api/bridge', { mode: 'pipeline', input, steps });
    } else if (mode === 'tools') {
      data = await post('/api/bridge', {
        mode: 'tools',
        input,
        tools: ['web_search', 'calculator', 'code_executor', 'memory_lookup'],
      });
    } else {
      // chat, search
      data = await post('/api/bridge', { mode, input });
    }
    show(data);
  } catch (e) {
    resultOutput.textContent = `Error: ${e.message}`;
  }
});

document.getElementById('connectorsBtn').addEventListener('click', async () => {
  resultOutput.textContent = 'Loading...';
  try { show(await get('/api/connectors')); } catch (e) { resultOutput.textContent = `Error: ${e.message}`; }
});

document.getElementById('agiBtn').addEventListener('click', async () => {
  resultOutput.textContent = 'Loading...';
  try { show(await get('/admin/agi-status')); } catch (e) { resultOutput.textContent = `Error: ${e.message}`; }
});

document.getElementById('cacheBtn').addEventListener('click', async () => {
  resultOutput.textContent = 'Loading...';
  try { show(await get('/admin/cache-stats')); } catch (e) { resultOutput.textContent = `Error: ${e.message}`; }
});
