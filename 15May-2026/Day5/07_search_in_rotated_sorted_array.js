/**
 * LC-33 | Search in Rotated Sorted Array
 * Difficulty : Medium
 * Pattern    : Binary Search with rotation check
 * Companies  : Google, Amazon, Meta, Microsoft
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   An array was sorted in ascending order, then rotated at some pivot.
 *   Given the rotated array and a target, return its index or -1.
 *   Must run in O(log n) time.
 *
 * EXAMPLE:
 *   nums = [4, 5, 6, 7, 0, 1, 2], target = 0  → index 4
 *   nums = [4, 5, 6, 7, 0, 1, 2], target = 3  → -1
 *
 * APPROACH — Modified Binary Search:
 *   At every mid, ONE of the two halves is always sorted.
 *   Check which half is sorted, then decide which side target lives in.
 *
 *   Step 1: find mid
 *   Step 2: if nums[left] <= nums[mid] → LEFT half is sorted
 *     - if target is within [nums[left], nums[mid]) → go left
 *     - else → go right
 *   Step 3: else → RIGHT half is sorted
 *     - if target is within (nums[mid], nums[right]] → go right
 *     - else → go left
 *
 * TRACE: nums=[4,5,6,7,0,1,2], target=0
 *   lo=0, hi=6, mid=3 → nums[mid]=7
 *   Left [4,5,6,7] is sorted. target 0 NOT in [4,7] → go right
 *   lo=4, hi=6, mid=5 → nums[mid]=1
 *   Right [1,2] is sorted. target 0 NOT in [1,2] → go left
 *   lo=4, hi=4, mid=4 → nums[mid]=0 === target → return 4 ✓
 */

function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;

    // left half is sorted
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1; // target is in left half
      } else {
        lo = mid + 1; // target is in right half
      }
    } else {
      // right half is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1; // target is in right half
      } else {
        hi = mid - 1; // target is in left half
      }
    }
  }

  return -1; // not found
}

// --- Tests ---
console.log(search([4, 5, 6, 7, 0, 1, 2], 0));  // 4
console.log(search([4, 5, 6, 7, 0, 1, 2], 3));  // -1
console.log(search([1], 0));                      // -1
console.log(search([1], 1));                      // 0
console.log(search([3, 1], 1));                   // 1
