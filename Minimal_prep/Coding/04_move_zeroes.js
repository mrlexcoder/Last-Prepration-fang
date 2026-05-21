/**
 * Q4 | Move Zeroes to End
 * Difficulty : Easy
 * Pattern    : Two-pointer
 * Companies  : Accenture, HCL, Cognizant
 *
 * PROBLEM:
 *   Move all 0s to end while maintaining relative order of non-zero elements.
 *   Do it in-place.
 *
 * APPROACH:
 *   slow pointer tracks next position for non-zero element.
 *   fast pointer scans array.
 *   When fast finds non-zero → place at slow, advance slow.
 *   Fill rest with zeros.
 *
 * TIME: O(n)  SPACE: O(1)
 */

function moveZeroes(nums) {
  let slow = 0; // next write position for non-zero

  // move all non-zeros to front
  for (let fast = 0; fast < nums.length; fast++) {
    if (nums[fast] !== 0) {
      nums[slow++] = nums[fast];
    }
  }

  // fill remaining positions with 0
  while (slow < nums.length) nums[slow++] = 0;

  return nums;
}

// --- Tests ---
console.log(moveZeroes([0, 1, 0, 3, 12])); // [1, 3, 12, 0, 0]
console.log(moveZeroes([0]));               // [0]
console.log(moveZeroes([1, 0, 1]));         // [1, 1, 0]
