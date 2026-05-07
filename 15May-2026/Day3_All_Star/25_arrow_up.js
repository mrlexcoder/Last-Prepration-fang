/**
 * Pattern 25: Arrow Pointing Up
 *
 * n=5 output:
 *     *
 *    ***
 *   *****
 *  *******
 * *********
 *     *
 *     *
 *     *
 *     *
 *
 * Logic:
 *   Top: pyramid (n rows)
 *   Tail: n-1 rows of single star at center
 */

function arrowUp(n) {
  // pyramid head
  for (let i = 1; i <= n; i++) {
    console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
  }
  // vertical tail
  const mid = " ".repeat(n - 1);
  for (let i = 1; i < n; i++) {
    console.log(mid + "*");
  }
}

arrowUp(5);
