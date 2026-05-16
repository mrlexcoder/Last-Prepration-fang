/**
 * Pattern 6: Hollow Rectangle
 *
 * rows=4, cols=6 output:
 * ******
 * *    *
 * *    *
 * ******
 *
 * Logic:
 *   First and last row → all stars
 *   Middle rows → star + spaces + star
 */

function hollowRectangle(rows, cols) {
  for (let i = 1; i <= rows; i++) {
    if (i === 1 || i === rows) {
      console.log("*".repeat(cols));
    } else {
      console.log("*" + " ".repeat(cols - 2) + "*");
    }
  }
}

hollowRectangle(4, 6);
