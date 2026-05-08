/**
 * Pattern 17: Alphabet Pyramid (Centered)
 *
 * n=5 output:
 *     A
 *    ABA
 *   ABCBA
 *  ABCDCBA
 * ABCDEDCBA
 *
 * Logic: row i →
 *   spaces = (n - i)
 *   letters = A..chr(A+i-1) then back chr(A+i-2)..A
 */

function alphabetPyramid(n) {
  for (let i = 1; i <= n; i++) {
    let row = "";
    // ascending A to current letter
    for (let j = 0; j < i; j++) {
      row += String.fromCharCode(65 + j);
    }
    // descending back (skip the peak letter)
    for (let j = i - 2; j >= 0; j--) {
      row += String.fromCharCode(65 + j);
    }
    console.log(" ".repeat(n - i) + row);
  }
}

alphabetPyramid(5);
