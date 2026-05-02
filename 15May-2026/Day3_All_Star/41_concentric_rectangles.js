/**
 * Pattern 41: Concentric Rectangles (Onion Pattern)
 *
 * n=4 output:
 * 4 4 4 4 4 4 4
 * 4 3 3 3 3 3 4
 * 4 3 2 2 2 3 4
 * 4 3 2 1 2 3 4
 * 4 3 2 2 2 3 4
 * 4 3 3 3 3 3 4
 * 4 4 4 4 4 4 4
 *
 * Logic:
 *   Grid size = (2n-1) x (2n-1)
 *   cell(i,j) = n - min(i, j, 2n-2-i, 2n-2-j)
 */

function concentricRectangles(n) {
  const size = 2 * n - 1;
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(n - Math.min(i, j, size - 1 - i, size - 1 - j));
    }
    console.log(row.join(" "));
  }
}

concentricRectangles(4);
