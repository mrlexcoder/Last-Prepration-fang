/**
 * Pattern 3: Pyramid (Centered Triangle)
 *
 * n=5 output:
 *     *
 *    ***
 *   *****
 *  *******
 * *********
 *
 * Logic: row i →
 *   spaces = (n - i) spaces
 *   stars  = (2*i - 1) stars
 */

function pyramid(n) {
  for (let i = 1; i <= n; i++) {
    const spaces = " ".repeat(n - i);
    const stars  = "*".repeat(2 * i - 1);
    console.log(spaces + stars);
  }
}

pyramid(5);
