/**
 * Pattern 26: Wave / Column Pattern
 *
 * n=4 output:
 * *
 * **
 * ***
 * ****
 * ***
 * **
 * *
 * **
 * ***
 * ****
 * ...
 * (one full wave cycle shown)
 *
 * Logic:
 *   Goes up from 1 to n, then back down to 1 (one wave)
 *   Repeat for `waves` cycles
 */

function waveColumn(n, waves = 2) {
  for (let w = 0; w < waves; w++) {
    for (let i = 1; i <= n; i++) console.log("*".repeat(i));
    for (let i = n - 1; i >= 1; i--) console.log("*".repeat(i));
  }
}

waveColumn(4, 2);
