/**
 * Pattern 5: Diamond
 *
 * n=5 output:
 *     *
 *    ***
 *   *****
 *  *******
 * *********
 *  *******
 *   *****
 *    ***
 *     *
 *
 * Logic:
 *   Top half (pyramid):    rows 1..n
 *   Bottom half (inverted): rows n-1..1
 */

function diamond(n) {
  // top half
  for (let i = 1; i <= n; i++) {
    console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
  }
  // bottom half
  for (let i = n - 1; i >= 1; i--) {
    console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
  }
}

diamond(5);
