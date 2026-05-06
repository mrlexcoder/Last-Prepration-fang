/**
 * Pattern 32: Reverse Number Triangle
 *
 * n=5 output:
 * 1 2 3 4 5
 * 1 2 3 4
 * 1 2 3
 * 1 2
 * 1
 *
 * Logic: row i (from n down to 1) → print numbers 1..i
 */

function reverseNumberTriangle(n) {
  for (let i = n; i >= 1; i--) {
    const row = Array.from({ length: i }, (_, k) => k + 1).join(" ");
    console.log(row);
  }
}

reverseNumberTriangle(5);
