/**
 * Q37 | Binary Search on Sorted Array
 * Difficulty : Easy
 * Pattern    : Low-mid-high
 * Companies  : Every MNC
 *
 * PROBLEM:
 *   Given sorted array and target, return index or -1.
 *
 * APPROACH:
 *   lo=0, hi=n-1. mid = lo + (hi-lo)/2 (avoids overflow).
 *   If nums[mid] === target → found.
 *   If nums[mid] < target  → search right (lo = mid+1).
 *   If nums[mid] > target  → search left  (hi = mid-1).
 *
 * TIME: O(log n)  SPACE: O(1)
 */

function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);

    if      (nums[mid] === target) return mid;
    else if (nums[mid] < target)   lo = mid + 1;
    else                           hi = mid - 1;
  }
  return -1;
}

// --- Tests ---
console.log(binarySearch([-1,0,3,5,9,12], 9));  // 4
console.log(binarySearch([-1,0,3,5,9,12], 2));  // -1
console.log(binarySearch([5], 5));               // 0
console.log(binarySearch([1,2,3,4,5], 1));       // 0
