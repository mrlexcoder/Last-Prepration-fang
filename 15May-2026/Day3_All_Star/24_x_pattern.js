/**
 * Pattern 24: X Pattern
 *
 * n=5 output (n must be odd):
 * *   *
 *  * *
 *   *
 *  * *
 * *   *
 *
 * Logic:
 *   For each row i (0-indexed):
 *     Star at column i (left diagonal)
 *     Star at column (n-1-i) (right diagonal)
 *     If both same (middle row) → one star
 */

function xPattern(n) {
  for (let i = 0; i < n; i++) {
    const row = Array(n).fill(" ");
    row[i] = "*";
    row[n - 1 - i] = "*";
    console.log(row.join(""));
  }
}

xPattern(5);
