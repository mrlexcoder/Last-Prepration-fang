/**
 * Pattern 13: Cross / Plus (+) Pattern
 *
 * n=5 output (n must be odd):
 *   *
 *   *
 * *****
 *   *
 *   *
 *
 * Logic:
 *   Middle row (i === mid) → all stars
 *   Other rows → star only at middle column
 *   mid = Math.floor(n / 2)
 */

function crossPlus(n) {
  const mid = Math.floor(n / 2);

  for (let i = 0; i < n; i++) {
    if (i === mid) {
      console.log("*".repeat(n));
    } else {
      console.log(" ".repeat(mid) + "*");
    }
  }
}

crossPlus(5);
