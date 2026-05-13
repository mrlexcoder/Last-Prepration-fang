/**
 * Pattern 11: Pascal's Triangle
 *
 * n=5 output:
 *     1
 *    1 1
 *   1 2 1
 *  1 3 3 1
 * 1 4 6 4 1
 *
 * Logic:
 *   Each row starts and ends with 1.
 *   Middle values: row[j] = prevRow[j-1] + prevRow[j]
 *   Add spaces for centering.
 */

function pascalTriangle(n) {
  let row = [1];

  for (let i = 0; i < n; i++) {
    const spaces = " ".repeat(n - i - 1);
    console.log(spaces + row.join(" "));

    // build next row
    const next = [1];
    for (let j = 1; j < row.length; j++) {
      next.push(row[j - 1] + row[j]);
    }
    next.push(1);
    row = next;
  }
}

pascalTriangle(5);
