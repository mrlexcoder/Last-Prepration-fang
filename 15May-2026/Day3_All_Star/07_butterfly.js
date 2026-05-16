/**
 * Pattern 7: Butterfly
 *
 * n=4 output:
 * *      *
 * **    **
 * ***  ***
 * ********
 * ********
 * ***  ***
 * **    **
 * *      *
 *
 * Logic:
 *   Top half (i = 1..n):
 *     stars = i, spaces = 2*(n-i), stars = i
 *   Bottom half (i = n..1):
 *     same formula
 */

function butterfly(n) {
  // top half
  for (let i = 1; i <= n; i++) {
    const stars  = "*".repeat(i);
    const spaces = " ".repeat(2 * (n - i));
    console.log(stars + spaces + stars);
  }
  // bottom half
  for (let i = n; i >= 1; i--) {
    const stars  = "*".repeat(i);
    const spaces = " ".repeat(2 * (n - i));
    console.log(stars + spaces + stars);
  }
}

butterfly(4);
