/**
 * Pattern 53: Horizontal Wave Stars
 *
 * n=5, cols=20 output:
 * *   *   *   *   *
 *  * * * * * * * *
 *   *   *   *   *
 *  * * * * * * * *
 * *   *   *   *   *
 *
 * Logic:
 *   3-row repeating wave unit:
 *     Row 0: stars at cols 0,4,8,12... (mod 4 === 0)
 *     Row 1: stars at cols 1,3,5,7... (mod 2 === 1)
 *     Row 2: stars at cols 2,6,10...  (mod 4 === 2)
 *   Repeat for `waves` cycles
 */

function waveStarHorizontal(cols = 17, waves = 2) {
  const patterns = [
    (c) => c % 4 === 0,
    (c) => c % 2 === 1,
    (c) => c % 4 === 2,
  ];

  for (let w = 0; w < waves; w++) {
    for (const fn of patterns) {
      let row = "";
      for (let c = 0; c < cols; c++) row += fn(c) ? "*" : " ";
      console.log(row);
    }
  }
}

waveStarHorizontal(17, 2);
