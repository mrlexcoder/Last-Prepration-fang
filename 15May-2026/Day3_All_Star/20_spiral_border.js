/**
 * Pattern 20: Spiral Border (Hollow Square with number border)
 *
 * n=5 output:
 * * * * * *
 * *       *
 * *       *
 * *       *
 * * * * * *
 *
 * Logic:
 *   First row / last row → all stars with spaces
 *   Middle rows → star + spaces + star
 *   Stars separated by spaces for visual clarity
 */

function spiralBorder(n) {
  for (let i = 1; i <= n; i++) {
    if (i === 1 || i === n) {
      // full row of stars separated by spaces
      console.log(Array(n).fill("*").join(" "));
    } else {
      // only first and last star, spaces in between
      const inner = " ".repeat(2 * n - 3);
      console.log("*" + inner + "*");
    }
  }
}

spiralBorder(5);
