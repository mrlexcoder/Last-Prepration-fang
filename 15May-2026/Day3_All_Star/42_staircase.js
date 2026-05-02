/**
 * Pattern 42: Staircase Pattern
 *
 * n=5 output:
 *     #
 *    ##
 *   ###
 *  ####
 * #####
 *
 * (right-aligned, using # for variety)
 *
 * Logic: row i → (n-i) spaces + i hashes
 * Classic HackerRank staircase problem.
 */

function staircase(n) {
  for (let i = 1; i <= n; i++) {
    console.log(" ".repeat(n - i) + "#".repeat(i));
  }
}

staircase(5);
