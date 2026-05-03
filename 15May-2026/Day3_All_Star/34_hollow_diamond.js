/**
 * Pattern 34: Hollow Diamond
 *
 * n=5 output:
 *     *
 *    * *
 *   *   *
 *  *     *
 * *       *
 *  *     *
 *   *   *
 *    * *
 *     *
 *
 * Logic:
 *   Top half (i=1..n):
 *     spaces = n-i
 *     if i===1 → single star
 *     else → star + (2i-3) spaces + star
 *   Bottom half (i=n-1..1): same
 */

function hollowDiamond(n) {
  for (let i = 1; i <= n; i++) {
    const sp = " ".repeat(n - i);
    if (i === 1) {
      console.log(sp + "*");
    } else {
      console.log(sp + "*" + " ".repeat(2 * i - 3) + "*");
    }
  }
  for (let i = n - 1; i >= 1; i--) {
    const sp = " ".repeat(n - i);
    if (i === 1) {
      console.log(sp + "*");
    } else {
      console.log(sp + "*" + " ".repeat(2 * i - 3) + "*");
    }
  }
}

hollowDiamond(5);
