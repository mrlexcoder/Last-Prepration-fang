/**
 * LC-15 | 3Sum
 * Difficulty : Medium
 * Pattern    : Sort + Two Pointers
 * Companies  : Google, Amazon, Meta, Adobe
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given an array nums, return all triplets [nums[i], nums[j], nums[k]]
 *   such that i != j != k and nums[i] + nums[j] + nums[k] == 0.
 *   Result must not contain duplicate triplets.
 *
 * APPROACH:
 *   1. Sort the array
 *   2. Fix one element nums[i], then use two pointers (lo, hi) on the rest
 *   3. If sum < 0 → move lo right, if sum > 0 → move hi left
 *   4. Skip duplicates at every level to avoid duplicate triplets
 *
 * EXAMPLE:
 *   nums = [-1, 0, 1, 2, -1, -4]
 *   sorted = [-4, -1, -1, 0, 1, 2]
 *
 *   i=0 (-4): lo=1, hi=5 → -4+-1+2=-3 < 0 → lo++
 *             lo=2, hi=5 → -4+-1+2=-3 < 0 → lo++
 *             lo=3, hi=5 → -4+0+2=-2 < 0 → lo++
 *             lo=4, hi=5 → -4+1+2=-1 < 0 → lo++  (lo>=hi, stop)
 *   i=1 (-1): lo=2, hi=5 → -1+-1+2=0 ✓ → save [-1,-1,2], skip dupes
 *             lo=3, hi=4 → -1+0+1=0 ✓ → save [-1,0,1], skip dupes
 *   i=2 (-1): skip (same as i=1)
 *   Answer: [[-1,-1,2],[-1,0,1]]
 */

function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < nums.length - 2; i++) {
    // skip duplicate values for i
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    // optimization: if smallest possible sum > 0, break
    if (nums[i] > 0) break;

    let lo = i + 1;
    let hi = nums.length - 1;

    while (lo < hi) {
      const sum = nums[i] + nums[lo] + nums[hi];

      if (sum === 0) {
        result.push([nums[i], nums[lo], nums[hi]]);
        // skip duplicates for lo and hi
        while (lo < hi && nums[lo] === nums[lo + 1]) lo++;
        while (lo < hi && nums[hi] === nums[hi - 1]) hi--;
        lo++;
        hi--;
      } else if (sum < 0) {
        lo++;
      } else {
        hi--;
      }
    }
  }

  return result;
}

// --- Tests ---
console.log(threeSum([-1, 0, 1, 2, -1, -4])); // [[-1,-1,2],[-1,0,1]]
console.log(threeSum([0, 1, 1]));              // []
console.log(threeSum([0, 0, 0]));              // [[0,0,0]]
