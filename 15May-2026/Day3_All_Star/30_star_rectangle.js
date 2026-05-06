/**
 * Pattern 30: Solid Rectangle
 *
 * rows=4, cols=7 output:
 * *******
 * *******
 * *******
 * *******
 *
 * Logic: every row is cols stars
 * Simple but foundational — base of all rectangle patterns
 */

function solidRectangle(rows, cols) {
  for (let i = 0; i < rows; i++) {
    console.log("*".repeat(cols));
  }
}

solidRectangle(4, 7);
