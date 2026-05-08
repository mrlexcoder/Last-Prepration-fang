/**
 * Pattern 18: Number Pyramid (Centered)
 *
 * n=5 output:
 *     1
 *    121
 *   12321
 *  1234321
 * 123454321
 *
 * Logic: row i →
 *   spaces = (n - i)
 *   numbers = 1..i then back (i-1)..1
 */

function numberPyramid(n) {
  for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= i; j++)     row += j;       // ascending
    for (let j = i - 1; j >= 1; j--) row += j;       // descending
    console.log(" ".repeat(n - i) + row);
  }
}

numberPyramid(5);
