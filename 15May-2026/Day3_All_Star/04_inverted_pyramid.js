/**
 * Pattern 4: Inverted Pyramid
 *
 * n=5 output:
 * *********
 *  *******
 *   *****
 *    ***
 *     *
 *
 * Logic: row i (from n down to 1) →
 *   spaces = (n - i) spaces
 *   stars  = (2*i - 1) stars
 */

function invertedPyramid(n) {
  for (let i = n; i >= 1; i--) {
    const spaces = " ".repeat(n - i);
    const stars  = "*".repeat(2 * i - 1);
    console.log(spaces + stars);
  }
}

invertedPyramid(5);
