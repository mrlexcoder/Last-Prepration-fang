/**
 * Q1 | Two Sum
 * Difficulty : Easy
 * Pattern    : HashMap O(n)
 * Companies  : Amazon, Google, Adobe
 *
 * PROBLEM:
 *   Given array nums and target, return indices of two numbers that add to target.
 *
 * APPROACH:
 *   For each number, check if (target - number) already seen in map.
 *   If yes → found the pair. If no → store current number with its index.
 *
 * TIME: O(n)  SPACE: O(n)
 */

function twoSum(nums, target) {
  const map = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) return [map.get(complement), i];
    map.set(nums[i], i);
  }
  return [];
}

// --- Tests ---
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));          // [0, 1]
