/**
 * Pattern 22: Right Pascal Triangle (right-aligned)
 *
 * n=5 output:
 *     *
 *    **
 *   ***
 *  ****
 * *****
 *  ****
 *   ***
 *    **
 *     *
 *
 * Logic:
 *   Top half: rows 1..n  → (n-i) spaces + i stars
 *   Bottom half: rows n-1..1 → (n-i) spaces + i stars
 */

function rightPascal(n) {
  for (let i = 1; i <= n; i++)
    console.log(" ".repeat(n - i) + "*".repeat(i));
  for (let i = n - 1; i >= 1; i--)
    console.log(" ".repeat(n - i) + "*".repeat(i));
}

rightPascal(5);
