/**
 * Pattern 36: Column-wise Numbers
 *
 * n=5 output:
 * 1 2 3 4 5
 * 1 2 3 4 5
 * 1 2 3 4 5
 * 1 2 3 4 5
 * 1 2 3 4 5
 *
 * Variation — each row repeats its row number:
 * 1 1 1 1 1
 * 2 2 2 2 2
 * 3 3 3 3 3
 * 4 4 4 4 4
 * 5 5 5 5 5
 *
 * Both shown below.
 */

function columnWiseNumbers(n) {
  console.log("-- Same columns each row --");
  for (let i = 1; i <= n; i++) {
    console.log(Array.from({ length: n }, (_, k) => k + 1).join(" "));
  }

  console.log("-- Row number repeated --");
  for (let i = 1; i <= n; i++) {
    console.log(Array(n).fill(i).join(" "));
  }
}

columnWiseNumbers(5);
