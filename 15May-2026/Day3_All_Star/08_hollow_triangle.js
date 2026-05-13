/**
 * Pattern 8: Hollow Triangle
 *
 * n=5 output:
 * *
 * **
 * * *
 * *  *
 * *****
 *
 * Logic:
 *   First row  → 1 star
 *   Last row   → all stars
 *   Middle rows → star + spaces + star
 */

function hollowTriangle(n) {
  for (let i = 1; i <= n; i++) {
    if (i === 1) {
      console.log("*");
    } else if (i === n) {
      console.log("*".repeat(n));
    } else {
      console.log("*" + " ".repeat(i - 2) + "*");
    }
  }
}

hollowTriangle(5);
