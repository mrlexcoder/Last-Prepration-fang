/**
 * Pattern 40: Snake / Boustrophedon Pattern
 *
 * n=4 output:
 *  1  2  3  4
 *  8  7  6  5
 *  9 10 11 12
 * 16 15 14 13
 *
 * Logic:
 *   Even rows (0-indexed) → fill left to right
 *   Odd rows              → fill right to left
 */

function snakePattern(n) {
  let num = 1;
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) row.push(num++);
    if (i % 2 !== 0) row.reverse();
    console.log(row.map(x => String(x).padStart(3)).join(" "));
  }
}

snakePattern(4);
