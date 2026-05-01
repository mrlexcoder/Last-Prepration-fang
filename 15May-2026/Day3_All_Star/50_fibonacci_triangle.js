/**
 * Pattern 50: Fibonacci Triangle
 *
 * n=5 output:
 * 0
 * 0 1
 * 0 1 1
 * 0 1 1 2
 * 0 1 1 2 3
 *
 * Logic:
 *   Generate Fibonacci sequence up to n*(n+1)/2 terms
 *   Row i → print i Fibonacci numbers
 */

function fibonacciTriangle(n) {
  const total = (n * (n + 1)) / 2;
  const fibs = [0, 1];
  while (fibs.length < total) {
    fibs.push(fibs[fibs.length - 1] + fibs[fibs.length - 2]);
  }

  let idx = 0;
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 0; j < i; j++) row.push(fibs[idx++]);
    console.log(row.join(" "));
  }
  // Note: sequence is 0,1,1,2,3,5,8,13,21...
  // Row 1: 0 | Row 2: 1 1 | Row 3: 2 3 5 | etc.
}

fibonacciTriangle(5);
