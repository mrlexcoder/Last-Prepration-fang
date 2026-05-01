/**
 * Pattern 54: Matrix Layer Rotation Display
 *
 * n=4 output — shows which "ring" each cell belongs to:
 * 0 0 0 0
 * 0 1 1 0
 * 0 1 1 0
 * 0 0 0 0
 *
 * n=5:
 * 0 0 0 0 0
 * 0 1 1 1 0
 * 0 1 2 1 0
 * 0 1 1 1 0
 * 0 0 0 0 0
 *
 * Logic:
 *   cell(i,j) = min(i, j, n-1-i, n-1-j)
 *   This is the "layer" or "ring" number from outside in.
 *   Useful for understanding matrix rotation problems.
 */

function matrixRotationPattern(n) {
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      row.push(Math.min(i, j, n - 1 - i, n - 1 - j));
    }
    console.log(row.join(" "));
  }
}

console.log("n=4:");
matrixRotationPattern(4);
console.log("n=5:");
matrixRotationPattern(5);
