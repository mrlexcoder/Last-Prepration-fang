/**
 * Pattern 44: Palindrome Number Triangle
 *
 * n=5 output:
 *     1
 *    212
 *   32123
 *  4321234
 * 543212345
 *
 * Logic: row i →
 *   spaces = n-i
 *   descending i..1 then ascending 2..i
 */

function palindromeTriangle(n) {
  for (let i = 1; i <= n; i++) {
    let row = "";
    for (let j = i; j >= 1; j--) row += j; // descending
    for (let j = 2; j <= i; j++) row += j; // ascending (skip 1)
    console.log(" ".repeat(n - i) + row);
  }
}

palindromeTriangle(5);
