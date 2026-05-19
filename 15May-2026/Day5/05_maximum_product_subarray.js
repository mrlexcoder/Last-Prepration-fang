/**
 * LC-152 | Maximum Product Subarray
 * Difficulty : Medium
 * Pattern    : Dynamic Programming — track max AND min
 * Companies  : Amazon, LinkedIn, Google
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given an integer array `nums`, find the contiguous subarray
 *   that has the largest product and return that product.
 *
 * WHY IS THIS HARDER THAN KADANE'S?
 *   Negative numbers! A large negative × another negative = large positive.
 *   So we must track BOTH the maximum AND minimum product ending at i,
 *   because today's minimum could become tomorrow's maximum.
 *
 * APPROACH:
 *   At each index i, the new max/min can come from:
 *     1. nums[i] alone          (start fresh)
 *     2. maxPrev * nums[i]      (extend the max streak)
 *     3. minPrev * nums[i]      (negative × negative = positive!)
 *
 *   currMax = max(nums[i], maxPrev * nums[i], minPrev * nums[i])
 *   currMin = min(nums[i], maxPrev * nums[i], minPrev * nums[i])
 *   result  = max(result, currMax)
 *
 * EXAMPLE:
 *   nums = [2, 3, -2, 4]
 *
 *   i=0: max=2,   min=2,   result=2
 *   i=1: max=6,   min=3,   result=6
 *   i=2: max=-2,  min=-12, result=6   ← negative breaks the streak
 *   i=3: max=4,   min=-48, result=6
 *   Answer: 6  (subarray [2,3])
 *
 *   nums = [-2, 3, -4]
 *   i=0: max=-2,  min=-2,  result=-2
 *   i=1: max=3,   min=-6,  result=3
 *   i=2: max=24,  min=-12, result=24  ← (-6)*(-4)=24 ✓
 */

function maxProduct(nums) {
  let maxSoFar = nums[0];
  let minSoFar = nums[0];
  let result   = nums[0];

  for (let i = 1; i < nums.length; i++) {
    const curr = nums[i];

    // all three candidates for new max/min
    const tempMax = Math.max(curr, maxSoFar * curr, minSoFar * curr);
    const tempMin = Math.min(curr, maxSoFar * curr, minSoFar * curr);

    maxSoFar = tempMax;
    minSoFar = tempMin;
    result   = Math.max(result, maxSoFar);
  }

  return result;
}

// --- Tests ---
console.log(maxProduct([2, 3, -2, 4]));      // 6   → [2,3]
console.log(maxProduct([-2, 0, -1]));         // 0   → [0]
console.log(maxProduct([-2, 3, -4]));         // 24  → [-2,3,-4]
console.log(maxProduct([-2]));                // -2
console.log(maxProduct([0, 2]));              // 2
