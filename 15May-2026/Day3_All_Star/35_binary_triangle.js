/**
 * Pattern 35: Binary Triangle (alternating 0s and 1s)
 *
 * n=5 output:
 * 1
 * 0 1
 * 1 0 1
 * 0 1 0 1
 * 1 0 1 0 1
 *
 * Logic:
 *   row i starts with (i % 2 === 1 ? 1 : 0)
 *   each cell alternates: cell(i,j) = (i+j) % 2 === 0 ? 1 : 0
 *   (when i and j have same parity → 1, else → 0)
 */

function binaryTriangle(n) {
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 1; j <= i; j++) {
      row.push((i + j) % 2 === 0 ? 1 : 0);
    }
    console.log(row.join(" "));
  }
}

binaryTriangle(5);
