/**
 * Q3 | Maximum Subarray (Kadane's Algorithm)
 * Difficulty : Easy
 * Pattern    : DP O(n)
 * Companies  : Google, TCS, Wipro
 *
 * PROBLEM:
 *   Find contiguous subarray with the largest sum.
 *
 * APPROACH (Kadane's):
 *   At each index decide: extend previous subarray OR start fresh.
 *   curr = max(nums[i], curr + nums[i])
 *   If running sum goes negative, starting fresh is always better.
 *
 * TIME: O(n)  SPACE: O(1)
 */

function maxSubArray(nums) {
  let curr = nums[0];
  let best = nums[0];

  for (let i = 1; i < nums.length; i++) {
    curr = Math.max(nums[i], curr + nums[i]); // extend or restart
    best = Math.max(best, curr);
  }
  return best;
}

// --- Tests ---
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([1]));                               // 1
console.log(maxSubArray([5, 4, -1, 7, 8]));                 // 23
console.log(maxSubArray([-3, -2, -1]));                     // -1
