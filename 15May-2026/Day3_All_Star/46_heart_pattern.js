/**
 * Pattern 46: Heart Pattern
 *
 * n=6 output:
 *  ***   ***
 * ***** *****
 * ***********
 *  *********
 *   *******
 *    *****
 *     ***
 *      *
 *
 * Logic:
 *   Top half: two bumps side by side
 *     row i (1..n/2):
 *       left bump:  (n/2-i) spaces + (2i-1) stars
 *       gap:        (n - 2*(2i-1)) spaces  (shrinks)
 *       right bump: (2i-1) stars
 *   Bottom half: inverted pyramid centered
 *     row i (1..n/2):
 *       spaces = i, stars = n*2-1 - 2*i
 */

function heartPattern(n) {
  const half = Math.floor(n / 2);

  // top bumps
  for (let i = 1; i <= half; i++) {
    const bumpStars = 2 * i - 1;
    const gap       = n - 2 * bumpStars;
    const leftSp    = " ".repeat(half - i + 1);
    const gapSp     = gap > 0 ? " ".repeat(gap) : " ";
    console.log(leftSp + "*".repeat(bumpStars) + gapSp + "*".repeat(bumpStars));
  }

  // bottom inverted pyramid
  const total = 2 * n - 1;
  for (let i = 0; i < half + 1; i++) {
    const stars = total - 2 * i;
    if (stars <= 0) break;
    console.log(" ".repeat(i + 1) + "*".repeat(stars));
  }
}

heartPattern(6);
