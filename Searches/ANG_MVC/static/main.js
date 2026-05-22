const invokeBtn = document.getElementById('invokeBtn');
const resultOutput = document.getElementById('resultOutput');

invokeBtn.addEventListener('click', async () => {
  const input = document.getElementById('inputText').value.trim();
  const latencyBudget = Number(document.getElementById('latencyBudget').value);
  const runtimeHint = document.getElementById('runtimeHint').value.trim() || null;

  resultOutput.textContent = 'Executing...';

  try {
    const response = await fetch('/api/infer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, latency_budget_ms: latencyBudget, runtime_hint: runtimeHint }),
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.detail || 'Execution failed');
    }

    const data = await response.json();
    resultOutput.textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    resultOutput.textContent = `Error: ${error.message}`;
  }
});
