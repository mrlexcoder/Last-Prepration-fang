/**
 * Pattern 51: Square Number Pattern
 *
 * n=4 output:
 * 1 2 3 4
 * 5 6 7 8
 * 9 10 11 12
 * 13 14 15 16
 *
 * Variation — distance from nearest border (like star frame but numbers):
 * 1 1 1 1 1 1 1
 * 1 2 2 2 2 2 1
 * 1 2 3 3 3 2 1
 * 1 2 3 4 3 2 1
 * 1 2 3 3 3 2 1
 * 1 2 2 2 2 2 1
 * 1 1 1 1 1 1 1
 *
 * Both shown.
 */

function squareNumbers(n) {
  console.log("-- Sequential fill --");
  let num = 1;
  for (let i = 0; i < n; i++) {
    const row = [];
    for (let j = 0; j < n; j++) row.push(num++);
    console.log(row.join(" "));
  }

  console.log("-- Distance from border --");
  const size = 2 * n - 1;
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push(Math.min(i, j, size - 1 - i, size - 1 - j) + 1);
    }
    console.log(row.join(" "));
  }
}

squareNumbers(4);
