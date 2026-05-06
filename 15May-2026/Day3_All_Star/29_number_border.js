/**
 * Pattern 29: Number Border Square
 *
 * n=5 output:
 * 1 2 3 4 5
 * 2       4
 * 3       3
 * 4       2
 * 5 4 3 2 1
 *
 * Logic:
 *   First row: 1 to n
 *   Last row:  n to 1
 *   Middle rows: left = i, right = (n+1-i), spaces in between
 */

function numberBorder(n) {
  for (let i = 1; i <= n; i++) {
    if (i === 1) {
      console.log(Array.from({ length: n }, (_, k) => k + 1).join(" "));
    } else if (i === n) {
      console.log(Array.from({ length: n }, (_, k) => n - k).join(" "));
    } else {
      const inner = " ".repeat(2 * n - 3);
      console.log(i + inner + (n + 1 - i));
    }
  }
}

numberBorder(5);
