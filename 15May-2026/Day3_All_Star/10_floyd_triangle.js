/**
 * Pattern 10: Floyd's Triangle
 *
 * n=5 output:
 * 1
 * 2 3
 * 4 5 6
 * 7 8 9 10
 * 11 12 13 14 15
 *
 * Logic: continuously incrementing counter across all rows
 *   row i → print i numbers starting from where we left off
 */

function floydTriangle(n) {
  let count = 1;
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 1; j <= i; j++) {
      row.push(count++);
    }
    console.log(row.join(" "));
  }
}

floydTriangle(5);
