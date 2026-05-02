/**
 * Pattern 45: Zigzag Number Triangle
 *
 * n=5 output:
 * 1
 * 2 3
 * 6 5 4
 * 7 8 9 10
 * 15 14 13 12 11
 *
 * Logic:
 *   Odd rows  → fill left to right
 *   Even rows → fill right to left
 *   Continuous counter across rows
 */

function zigzagNumbers(n) {
  let num = 1;
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 0; j < i; j++) row.push(num++);
    if (i % 2 === 0) row.reverse();
    console.log(row.join(" "));
  }
}

zigzagNumbers(5);
