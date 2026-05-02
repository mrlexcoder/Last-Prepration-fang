/**
 * Pattern 43: Triangle with Row Number Repeated
 *
 * n=5 output:
 * 1
 * 2 2
 * 3 3 3
 * 4 4 4 4
 * 5 5 5 5 5
 *
 * Logic: row i → print i repeated i times
 */

function triangleNumbersReverse(n) {
  for (let i = 1; i <= n; i++) {
    console.log(Array(i).fill(i).join(" "));
  }
}

triangleNumbersReverse(5);
