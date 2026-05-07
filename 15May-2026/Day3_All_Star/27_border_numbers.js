/**
 * Pattern 27: Border with Row Numbers
 *
 * n=5 output:
 * 1 1 1 1 1
 * 2       2
 * 3       3
 * 4       4
 * 5 5 5 5 5
 *
 * Logic:
 *   First and last row → repeat row number n times
 *   Middle rows → row number + spaces + row number
 */

function borderNumbers(n) {
  for (let i = 1; i <= n; i++) {
    if (i === 1 || i === n) {
      console.log(Array(n).fill(i).join(" "));
    } else {
      const inner = " ".repeat(2 * n - 3);
      console.log(i + inner + i);
    }
  }
}

borderNumbers(5);
