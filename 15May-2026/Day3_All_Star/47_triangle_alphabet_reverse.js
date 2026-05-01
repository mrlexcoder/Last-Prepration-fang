/**
 * Pattern 47: Reverse Alphabet Triangle
 *
 * n=5 output:
 * E
 * E D
 * E D C
 * E D C B
 * E D C B A
 *
 * Logic: row i → print letters from chr(A+n-1) down to chr(A+n-i)
 */

function reverseAlphabetTriangle(n) {
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = n - 1; j >= n - i; j--) {
      row.push(String.fromCharCode(65 + j));
    }
    console.log(row.join(" "));
  }
}

reverseAlphabetTriangle(5);
