/**
 * LC-1 | Two Sum
 * Difficulty : Easy
 * Pattern    : HashMap — complement lookup
 * Companies  : Google, Amazon, Microsoft, Meta, Adobe
 * Must-Do    : Yes (most asked interview question)
 *
 * PROBLEM:
 *   Given an array `nums` and a `target`, return the indices of the
 *   two numbers that add up to target. Each input has exactly one
 *   solution. You may not use the same element twice.
 *
 * APPROACH — One-pass HashMap:
 *   For each number, we need its complement = target - nums[i].
 *   - Check if complement already exists in the map → found the pair!
 *   - Otherwise store nums[i] → index in the map for future lookups.
 *
 *   This avoids the O(n²) brute force nested loop.
 *   O(n) time, O(n) space.
 *
 * EXAMPLE:
 *   nums = [2, 7, 11, 15], target = 9
 *
 *   i=0: complement = 9-2 = 7  → not in map → store {2:0}
 *   i=1: complement = 9-7 = 2  → 2 IS in map at index 0 → return [0,1] ✓
 *
 * EXAMPLE 2:
 *   nums = [3, 2, 4], target = 6
 *
 *   i=0: complement = 3 → not in map → store {3:0}
 *   i=1: complement = 4 → not in map → store {3:0, 2:1}
 *   i=2: complement = 2 → 2 IS in map at index 1 → return [1,2] ✓
 */

function twoSum(nums, target) {
  const map = new Map(); // value → index

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i]; // found the pair
    }

    map.set(nums[i], i); // store current number for future lookups
  }

  return []; // no solution (problem guarantees one exists)
}

// --- Tests ---
console.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]
console.log(twoSum([3, 2, 4], 6));       // [1, 2]
console.log(twoSum([3, 3], 6));          // [0, 1]
console.log(twoSum([1, 5, 3, 7], 8));    // [1, 2]  (5+3)
