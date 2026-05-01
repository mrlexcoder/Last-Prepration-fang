/**
 * Pattern 49: Star Cross with Both Diagonals + Middle Lines
 *
 * n=5 output (n must be odd):
 * *   *   *
 *  *  *  *
 *   * * *
 *    ***
 * *********
 *    ***
 *   * * *
 *  *  *  *
 * *   *   *
 *
 * Logic:
 *   For each row i (0-indexed, 0..n-1):
 *     mid = n/2
 *     star at col i (left→right diagonal)
 *     star at col n-1-i (right→left diagonal)
 *     star at col mid (vertical center)
 *     if i === mid → full row of stars (horizontal center)
 */

function starCrossDiagonal(n) {
  const mid = Math.floor(n / 2);
  for (let i = 0; i < n; i++) {
    const row = Array(n).fill(" ");
    if (i === mid) {
      for (let j = 0; j < n; j++) row[j] = "*";
    } else {
      row[i]         = "*";
      row[n - 1 - i] = "*";
      row[mid]       = "*";
    }
    console.log(row.join(""));
  }
}

starCrossDiagonal(9);
