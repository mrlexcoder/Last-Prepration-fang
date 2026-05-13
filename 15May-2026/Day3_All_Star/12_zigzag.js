/**
 * Pattern 12: Zigzag / Wave Pattern
 *
 * n=5 output:
 * *   *   *
 *  * * * *
 *   *   *
 *
 * Logic: 3 rows fixed
 *   Row 1: stars at positions 0, 4, 8 ... (every 4th, starting 0)
 *   Row 2: stars at positions 1, 3, 5 ... (every 2nd, starting 1)
 *   Row 3: stars at positions 2, 6, 10 ... (every 4th, starting 2)
 */

function zigzag(n) {
  const cols = 4 * n - 3;
  const grid = Array.from({ length: 3 }, () => Array(cols).fill(" "));

  for (let col = 0; col < cols; col++) {
    const mod = col % 4;
    if (mod === 0) grid[0][col] = "*";
    if (mod === 2) grid[2][col] = "*";
    if (mod === 1 || mod === 3) grid[1][col] = "*";
  }

  for (const row of grid) {
    console.log(row.join(""));
  }
}

zigzag(3);
