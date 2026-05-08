/**
 * Pattern 15: Right-Aligned Triangle
 *
 * n=5 output:
 *     *
 *    **
 *   ***
 *  ****
 * *****
 *
 * Logic: row i → (n-i) spaces + i stars
 */

function rightAlignedTriangle(n) {
  for (let i = 1; i <= n; i++) {
    console.log(" ".repeat(n - i) + "*".repeat(i));
  }
}

rightAlignedTriangle(5);
