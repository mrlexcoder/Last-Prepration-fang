/**
 * Pattern 37: Inverted V (Caret / Roof)
 *
 * n=5 output:
 *     *
 *    * *
 *   *   *
 *  *     *
 * *       *
 *
 * Logic: top half of hollow diamond only
 *   row i (1..n):
 *     spaces = n-i
 *     i===1 → single star
 *     else  → star + (2i-3) spaces + star
 */

function invertedV(n) {
  for (let i = 1; i <= n; i++) {
    const sp = " ".repeat(n - i);
    if (i === 1) {
      console.log(sp + "*");
    } else {
      console.log(sp + "*" + " ".repeat(2 * i - 3) + "*");
    }
  }
}

invertedV(5);
