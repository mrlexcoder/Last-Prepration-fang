/**
 * LC-53 | Maximum Subarray (Kadane's Algorithm)
 * Difficulty : Medium
 * Pattern    : Kadane's Algorithm (Dynamic Programming / Greedy)
 * Companies  : Amazon, Google, Microsoft, TCS, Infosys
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given an integer array `nums`, find the contiguous subarray
 *   (containing at least one number) with the largest sum and return it.
 *
 * APPROACH — Kadane's Algorithm:
 *   Key insight: at each position, decide whether to:
 *     (a) EXTEND the previous subarray: currentSum + nums[i]
 *     (b) START fresh from nums[i]
 *   Pick whichever is larger → currentSum = max(nums[i], currentSum + nums[i])
 *
 *   If currentSum ever beats maxSum, update maxSum.
 *
 * WHY IT WORKS:
 *   If the running sum becomes negative, it can only HURT future sums.
 *   Starting fresh (option b) discards that negative baggage.
 *
 * EXAMPLE:
 *   nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
 *
 *   i=0: curr=-2,  max=-2
 *   i=1: curr=1,   max=1   ← fresh start (1 > -2+1=-1)
 *   i=2: curr=-2,  max=1
 *   i=3: curr=4,   max=4   ← fresh start (4 > -2+4=2)
 *   i=4: curr=3,   max=4
 *   i=5: curr=5,   max=5
 *   i=6: curr=6,   max=6   ← best subarray [4,-1,2,1]
 *   i=7: curr=1,   max=6
 *   i=8: curr=5,   max=6
 *   Answer: 6 ✓
 */

function maxSubArray(nums) {
  let currentSum = nums[0]; // best sum ending at current position
  let maxSum = nums[0];     // best sum seen overall

  for (let i = 1; i < nums.length; i++) {
    // extend or start fresh
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }

  return maxSum;
}

// --- Tests ---
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 6
console.log(maxSubArray([1]));                               // 1
console.log(maxSubArray([5, 4, -1, 7, 8]));                 // 23
console.log(maxSubArray([-3, -2, -1]));                     // -1 (all negative)
