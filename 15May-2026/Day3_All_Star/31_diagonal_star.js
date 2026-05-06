/**
 * Pattern 31: Diagonal Star (Main + Anti diagonal)
 *
 * n=5 output:
 * *   *
 * * *
 * *
 * * *
 * *   *
 *
 * Wait — let's do BOTH diagonals (X already done),
 * so this is MAIN diagonal only:
 *
 * *
 *  *
 *   *
 *    *
 *     *
 *
 * Logic: row i → (i-1) spaces + star
 */

function diagonalStar(n) {
  for (let i = 1; i <= n; i++) {
    console.log(" ".repeat(i - 1) + "*");
  }
}

diagonalStar(5);
