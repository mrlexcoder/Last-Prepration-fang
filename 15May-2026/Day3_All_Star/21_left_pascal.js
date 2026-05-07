/**
 * Pattern 21: Left Pascal Triangle
 *
 * n=5 output:
 * *
 * **
 * ***
 * ****
 * *****
 * ****
 * ***
 * **
 * *
 *
 * Logic:
 *   Top half: rows 1..n  → i stars
 *   Bottom half: rows n-1..1 → i stars
 */

function leftPascal(n) {
  for (let i = 1; i <= n; i++) console.log("*".repeat(i));
  for (let i = n - 1; i >= 1; i--) console.log("*".repeat(i));
}

leftPascal(5);
