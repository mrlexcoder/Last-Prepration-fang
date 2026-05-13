/**
 * Pattern 9: Number Triangle
 *
 * n=5 output:
 * 1
 * 1 2
 * 1 2 3
 * 1 2 3 4
 * 1 2 3 4 5
 *
 * Logic: row i → print numbers 1 to i
 */

function numberTriangle(n) {
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 1; j <= i; j++) {
      row.push(j);
    }
    console.log(row.join(" "));
  }
}

numberTriangle(5);
