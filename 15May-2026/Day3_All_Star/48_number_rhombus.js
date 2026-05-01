/**
 * Pattern 48: Number Rhombus
 *
 * n=4 output:
 *    1
 *   121
 *  12321
 * 1234321
 *  12321
 *   121
 *    1
 *
 * Logic:
 *   Top half (i=1..n): spaces=(n-i), row = 1..i then i-1..1
 *   Bottom half (i=n-1..1): same
 */

function numberRhombus(n) {
  const buildRow = (i) => {
    let row = "";
    for (let j = 1; j <= i; j++) row += j;
    for (let j = i - 1; j >= 1; j--) row += j;
    return row;
  };

  for (let i = 1; i <= n; i++)
    console.log(" ".repeat(n - i) + buildRow(i));
  for (let i = n - 1; i >= 1; i--)
    console.log(" ".repeat(n - i) + buildRow(i));
}

numberRhombus(4);
