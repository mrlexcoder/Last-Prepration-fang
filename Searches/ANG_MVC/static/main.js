const invokeBtn = document.getElementById('invokeBtn');
const loopBtn = document.getElementById('loopBtn');
const connectorsBtn = document.getElementById('connectorsBtn');
const resultOutput = document.getElementById('resultOutput');

function getInputs() {
  return {
    input: document.getElementById('inputText').value.trim(),
    latency_budget_ms: Number(document.getElementById('latencyBudget').value),
    runtime_hint: document.getElementById('runtimeHint').value.trim() || null,
    max_iterations: Number(document.getElementById('maxIterations').value),
    confidence_threshold: Number(document.getElementById('confidenceThreshold').value),
  };
}

async function callApi(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Request failed');
  }
  return response.json();
}

invokeBtn.addEventListener('click', async () => {
  const { input, latency_budget_ms, runtime_hint } = getInputs();
  resultOutput.textContent = 'Executing...';
  try {
    const data = await callApi('/api/infer', { input, latency_budget_ms, runtime_hint });
    resultOutput.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    resultOutput.textContent = `Error: ${e.message}`;
  }
});

loopBtn.addEventListener('click', async () => {
  const { input, runtime_hint, max_iterations, confidence_threshold } = getInputs();
  resultOutput.textContent = 'Running automation loop...';
  try {
    const data = await callApi('/api/loop', { input, runtime_hint, max_iterations, confidence_threshold });
    resultOutput.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    resultOutput.textContent = `Error: ${e.message}`;
  }
});

connectorsBtn.addEventListener('click', async () => {
  resultOutput.textContent = 'Loading connectors...';
  try {
    const response = await fetch('/api/connectors');
    const data = await response.json();
    resultOutput.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    resultOutput.textContent = `Error: ${e.message}`;
  }
});
