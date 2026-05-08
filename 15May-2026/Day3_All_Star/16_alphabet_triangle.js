/**
 * Pattern 16: Alphabet Triangle
 *
 * n=5 output:
 * A
 * AB
 * ABC
 * ABCD
 * ABCDE
 *
 * Logic: row i → print letters A to (A + i - 1)
 */

function alphabetTriangle(n) {
  for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = 0; j < i; j++) {
      row += String.fromCharCode(65 + j); // 65 = 'A'
    }
    console.log(row);
  }
}

alphabetTriangle(5);
