/**
 * Pattern 33: Star Frame with Row & Col Numbers
 *
 * n=5 output:
 * * * * * *
 * *       *
 * *       *
 * *       *
 * * * * * *
 *
 * But inner cells show their distance from border:
 *
 * n=5 output:
 * * * * * *
 * * 1 1 1 *
 * * 1 2 1 *
 * * 1 1 1 *
 * * * * * *
 *
 * Logic:
 *   cell(i,j) value = min(i, j, n-1-i, n-1-j)
 *   0 → *, else → number
 */

function starFrame(n) {
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) {
      const dist = Math.min(i, j, n - 1 - i, n - 1 - j);
      row.push(dist === 0 ? "*" : dist);
    }
    console.log(row.join(" "));
  }
}

starFrame(7);
