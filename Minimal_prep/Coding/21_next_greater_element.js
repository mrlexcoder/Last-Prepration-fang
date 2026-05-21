/**
 * Q21 | Next Greater Element
 * Difficulty : Medium
 * Pattern    : Monotonic stack
 * Companies  : Amazon, TCS, Flipkart
 *
 * PROBLEM:
 *   For each element in nums1, find next greater element in nums2.
 *   Return -1 if none exists.
 *   nums1=[4,1,2], nums2=[1,3,4,2] → [-1,3,-1]
 *
 * APPROACH:
 *   Process nums2 with monotonic stack (decreasing).
 *   When we find a larger element, it's the NGE for stack top.
 *   Store results in HashMap, then look up for nums1.
 *
 * TIME: O(m+n)  SPACE: O(n)
 */

function nextGreaterElement(nums1, nums2) {
  const nge = new Map(); // value → next greater element
  const stack = [];      // monotonic decreasing stack

  for (const num of nums2) {
    // pop all elements smaller than current → current is their NGE
    while (stack.length && stack[stack.length - 1] < num) {
      nge.set(stack.pop(), num);
    }
    stack.push(num);
  }
  // remaining in stack have no NGE
  while (stack.length) nge.set(stack.pop(), -1);

  return nums1.map(n => nge.get(n));
}

// --- Tests ---
console.log(nextGreaterElement([4,1,2], [1,3,4,2])); // [-1,3,-1]
console.log(nextGreaterElement([2,4], [1,2,3,4]));   // [3,-1]
