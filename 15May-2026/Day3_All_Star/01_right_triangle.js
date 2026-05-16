/**
 * Pattern 1: Right Triangle (Left-aligned)
 *
 * n=5 output:
 * *
 * **
 * ***
 * ****
 * *****
 *
 * Logic: row i → print i stars
 */

function rightTriangle(n) {
  for (let i = 1; i <= n; i++) {
    console.log("*".repeat(i));
  }
}

rightTriangle(5);
