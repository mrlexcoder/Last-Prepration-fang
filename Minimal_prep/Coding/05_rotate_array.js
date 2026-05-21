/**
 * Q5 | Rotate Array by K Steps
 * Difficulty : Easy
 * Pattern    : Reverse trick
 * Companies  : Microsoft, TCS
 *
 * PROBLEM:
 *   Rotate array to the right by k steps in-place.
 *   [1,2,3,4,5,6,7], k=3 → [5,6,7,1,2,3,4]
 *
 * APPROACH (3-reverse trick):
 *   1. Reverse entire array
 *   2. Reverse first k elements
 *   3. Reverse remaining n-k elements
 *
 *   Why it works:
 *   Original:  1 2 3 4 | 5 6 7
 *   Reverse all: 7 6 5 4 3 2 1
 *   Rev [0..k-1]: 5 6 7 | 4 3 2 1
 *   Rev [k..n-1]: 5 6 7 | 1 2 3 4  ✓
 *
 * TIME: O(n)  SPACE: O(1)
 */

function rotate(nums, k) {
  const n = nums.length;
  k = k % n; // handle k > n
  if (k === 0) return nums;

  reverse(nums, 0, n - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, n - 1);
  return nums;
}

function reverse(arr, lo, hi) {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++; hi--;
  }
}

// --- Tests ---
console.log(rotate([1, 2, 3, 4, 5, 6, 7], 3)); // [5,6,7,1,2,3,4]
console.log(rotate([-1, -100, 3, 99], 2));       // [3,99,-1,-100]
console.log(rotate([1, 2], 3));                  // [2,1]
