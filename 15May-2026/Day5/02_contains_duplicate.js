/**
 * LC-217 | Contains Duplicate
 * Difficulty : Easy
 * Pattern    : HashSet — O(n) lookup
 * Companies  : Amazon, Google, Apple
 *
 * PROBLEM:
 *   Given an integer array `nums`, return true if any value appears
 *   at least twice. Return false if every element is distinct.
 *
 * APPROACH:
 *   - Use a Set to track numbers we have already seen.
 *   - For each number:
 *       • If it's already in the Set → duplicate found, return true.
 *       • Otherwise add it to the Set.
 *   - If we finish the loop without finding a duplicate → return false.
 *   - O(n) time, O(n) space.
 *
 * WHY NOT SORT?
 *   Sorting works too (O(n log n)) but HashSet is faster in practice
 *   and doesn't mutate the input array.
 *
 * EXAMPLE:
 *   nums = [1, 2, 3, 1]
 *   seen = {}
 *   i=0: 1 not in seen → add → seen={1}
 *   i=1: 2 not in seen → add → seen={1,2}
 *   i=2: 3 not in seen → add → seen={1,2,3}
 *   i=3: 1 IS in seen  → return true ✓
 */

function containsDuplicate(nums) {
  const seen = new Set();

  for (const num of nums) {
    if (seen.has(num)) return true; // duplicate found
    seen.add(num);
  }

  return false; // all elements are unique
}

// --- Tests ---
console.log(containsDuplicate([1, 2, 3, 1]));    // true
console.log(containsDuplicate([1, 2, 3, 4]));    // false
console.log(containsDuplicate([1, 1, 1, 3, 3])); // true
console.log(containsDuplicate([1]));              // false

// test