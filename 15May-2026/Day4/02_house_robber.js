/**
 * LC-198 | House Robber
 * Difficulty : Medium
 * Pattern    : Dynamic Programming (1D)
 * Companies  : Amazon, Google, Microsoft, Airbnb
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   You are a robber planning to rob houses along a street.
 *   Each house has some amount of money.
 *   Adjacent houses have a security system — you CANNOT rob
 *   two directly adjacent houses.
 *   Given an array nums of non-negative integers, return the
 *   maximum amount you can rob tonight.
 *
 * APPROACH:
 *   At each house i, you have two choices:
 *     1. SKIP house i  → best = dp[i-1]
 *     2. ROB house i   → best = dp[i-2] + nums[i]
 *   dp[i] = max(dp[i-1], dp[i-2] + nums[i])
 *
 *   Optimise space: only need last two values → O(1) space
 *
 * EXAMPLE:
 *   nums = [2, 7, 9, 3, 1]
 *
 *   i=0: prev2=0, prev1=2   (rob house 0 → 2)
 *   i=1: curr = max(2, 0+7) = 7   → prev2=2,  prev1=7
 *   i=2: curr = max(7, 2+9) = 11  → prev2=7,  prev1=11
 *   i=3: curr = max(11,7+3) = 11  → prev2=11, prev1=11
 *   i=4: curr = max(11,11+1)= 12  → prev2=11, prev1=12
 *   Answer: 12  (rob houses 0,2,4 → 2+9+1=12) ✓
 */

function rob(nums) {
  if (nums.length === 0) return 0;
  if (nums.length === 1) return nums[0];

  let prev2 = 0;          // dp[i-2]
  let prev1 = nums[0];    // dp[i-1]

  for (let i = 1; i < nums.length; i++) {
    const curr = Math.max(prev1, prev2 + nums[i]);
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// --- Tests ---
console.log(rob([1, 2, 3, 1]));       // 4  (rob 0+2 → 1+3)
console.log(rob([2, 7, 9, 3, 1]));    // 12 (rob 0+2+4 → 2+9+1)
console.log(rob([0]));                 // 0
console.log(rob([5]));                 // 5
console.log(rob([2, 1, 1, 2]));       // 4  (rob 0+3 → 2+2)
console.log(rob([1, 3, 1, 3, 100]));  // 103 (rob 1+3+4 → 3+3+100... wait)
// Actually: max(1,3,1,3,100) → rob idx 1,3 = 3+3=6 OR idx 1,4 = 3+100=103 ✓
