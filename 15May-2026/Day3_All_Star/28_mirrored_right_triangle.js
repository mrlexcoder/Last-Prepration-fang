/**
 * Pattern 28: Mirrored Right Triangle
 *
 * n=5 output:
 *     *
 *    **
 *   ***
 *  ****
 * *****
 * *****
 *  ****
 *   ***
 *    **
 *     *
 *
 * Logic:
 *   Top: right-aligned growing (rows 1..n)
 *   Bottom: right-aligned shrinking (rows n..1)
 */

function mirroredRightTriangle(n) {
  for (let i = 1; i <= n; i++)
    console.log(" ".repeat(n - i) + "*".repeat(i));
  for (let i = n; i >= 1; i--)
    console.log(" ".repeat(n - i) + "*".repeat(i));
}

mirroredRightTriangle(5);
