/**
 * Pattern 39: Spiral Numbers (Clockwise)
 *
 * n=4 output:
 *  1  2  3  4
 * 12 13 14  5
 * 11 16 15  6
 * 10  9  8  7
 *
 * Logic: fill an n×n matrix in clockwise spiral order
 *   Use 4 boundary pointers: top, bottom, left, right
 *   Fill top row → right col → bottom row → left col, shrink bounds
 */

function spiralNumbers(n) {
  const grid = Array.from({ length: n }, () => Array(n).fill(0));
  let top = 0, bottom = n - 1, left = 0, right = n - 1;
  let num = 1;

  while (top <= bottom && left <= right) {
    for (let i = left; i <= right; i++)  grid[top][i]    = num++;
    top++;
    for (let i = top; i <= bottom; i++)  grid[i][right]  = num++;
    right--;
    for (let i = right; i >= left; i--)  grid[bottom][i] = num++;
    bottom--;
    for (let i = bottom; i >= top; i--)  grid[i][left]   = num++;
    left++;
  }

  for (const row of grid) {
    console.log(row.map(n => String(n).padStart(3)).join(" "));
  }
}

spiralNumbers(4);
