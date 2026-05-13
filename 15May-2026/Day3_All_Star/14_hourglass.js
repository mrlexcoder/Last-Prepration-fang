/**
 * Pattern 14: Hourglass
 *
 * n=5 output:
 * *********
 *  *******
 *   *****
 *    ***
 *     *
 *    ***
 *   *****
 *  *******
 * *********
 *
 * Logic:
 *   Top half (inverted pyramid): rows n down to 1
 *   Bottom half (pyramid):       rows 2 up to n
 */

function hourglass(n) {
  // top half — inverted pyramid
  for (let i = n; i >= 1; i--) {
    const spaces = " ".repeat(n - i);
    const stars  = "*".repeat(2 * i - 1);
    console.log(spaces + stars);
  }
  // bottom half — pyramid (skip first row, already printed)
  for (let i = 2; i <= n; i++) {
    const spaces = " ".repeat(n - i);
    const stars  = "*".repeat(2 * i - 1);
    console.log(spaces + stars);
  }
}

hourglass(5);
