/**
 * Q38 | Find First & Last Position of Element in Sorted Array
 * Difficulty : Medium
 * Pattern    : 2× binary search
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Given sorted array with duplicates, find first and last index of target.
 *   Return [-1,-1] if not found.
 *
 * APPROACH:
 *   Run binary search twice:
 *   1. Find FIRST occurrence: when found, keep searching LEFT (hi = mid-1)
 *   2. Find LAST  occurrence: when found, keep searching RIGHT (lo = mid+1)
 *
 * TIME: O(log n)  SPACE: O(1)
 */

function searchRange(nums, target) {
  return [findFirst(nums, target), findLast(nums, target)];
}

function findFirst(nums, target) {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if      (nums[mid] === target) { result = mid; hi = mid - 1; } // go left
    else if (nums[mid] < target)   lo = mid + 1;
    else                           hi = mid - 1;
  }
  return result;
}

function findLast(nums, target) {
  let lo = 0, hi = nums.length - 1, result = -1;
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if      (nums[mid] === target) { result = mid; lo = mid + 1; } // go right
    else if (nums[mid] < target)   lo = mid + 1;
    else                           hi = mid - 1;
  }
  return result;
}

// --- Tests ---
console.log(searchRange([5,7,7,8,8,10], 8)); // [3,4]
console.log(searchRange([5,7,7,8,8,10], 6)); // [-1,-1]
console.log(searchRange([], 0));              // [-1,-1]
