/**
 * Pattern 2: Inverted Right Triangle
 *
 * n=5 output:
 * *****
 * ****
 * ***
 * **
 * *
 *
 * Logic: row i → print (n - i + 1) stars
 */

function invertedRightTriangle(n) {
  for (let i = n; i >= 1; i--) {
    console.log("*".repeat(i));
  }
}

invertedRightTriangle(5);
