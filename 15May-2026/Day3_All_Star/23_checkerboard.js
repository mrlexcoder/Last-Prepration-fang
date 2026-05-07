/**
 * Pattern 23: Checkerboard
 *
 * n=5 output:
 * * * * * *
 *  * * * *
 * * * * * *
 *  * * * *
 * * * * * *
 *
 * Logic:
 *   Odd rows  → start with *, alternate * and space
 *   Even rows → start with space, alternate space and *
 */

function checkerboard(n) {
  for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 1; j <= n; j++) {
      // cell is * if (i+j) is even, space otherwise
      row += (i + j) % 2 === 0 ? "*" : " ";
    }
    console.log(row);
  }
}

checkerboard(5);
