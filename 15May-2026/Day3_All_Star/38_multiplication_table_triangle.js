/**
 * Pattern 38: Multiplication Table Triangle
 *
 * n=5 output:
 * 1
 * 2  4
 * 3  6  9
 * 4  8  12 16
 * 5  10 15 20 25
 *
 * Logic:
 *   row i, col j → i * j
 *   pad each number for alignment
 */

function multiplicationTableTriangle(n) {
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 1; j <= i; j++) {
      row.push(String(i * j).padEnd(3));
    }
    console.log(row.join(" "));
  }
}

multiplicationTableTriangle(5);
