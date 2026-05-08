/**
 * Pattern 19: Sandglass Numbers
 *
 * n=5 output:
 * 1 2 3 4 5
 *  1 2 3 4
 *   1 2 3
 *    1 2
 *     1
 *    1 2
 *   1 2 3
 *  1 2 3 4
 * 1 2 3 4 5
 *
 * Logic:
 *   Top half: row i from n down to 1 → (n-i) spaces + numbers 1..i
 *   Bottom half: row i from 2 to n   → (n-i) spaces + numbers 1..i
 */

function sandglassNumbers(n) {
  // top half
  for (let i = n; i >= 1; i--) {
    const nums = Array.from({ length: i }, (_, k) => k + 1).join(" ");
    console.log(" ".repeat(n - i) + nums);
  }
  // bottom half
  for (let i = 2; i <= n; i++) {
    const nums = Array.from({ length: i }, (_, k) => k + 1).join(" ");
    console.log(" ".repeat(n - i) + nums);
  }
}

sandglassNumbers(5);
