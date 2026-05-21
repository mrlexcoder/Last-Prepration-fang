/**
 * Q7 | Product of Array Except Self
 * Difficulty : Medium
 * Pattern    : Prefix × suffix (no division)
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Return array where answer[i] = product of all elements except nums[i].
 *   No division. O(n) time.
 *
 * APPROACH:
 *   Pass 1 (left→right): answer[i] = product of all elements LEFT of i
 *   Pass 2 (right→left): multiply answer[i] by product of all elements RIGHT of i
 *
 * TIME: O(n)  SPACE: O(1) extra
 */

function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);

  // left pass: answer[i] = product of nums[0..i-1]
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    left *= nums[i];
  }

  // right pass: multiply by product of nums[i+1..n-1]
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    right *= nums[i];
  }

  return answer;
}

// --- Tests ---
console.log(productExceptSelf([1, 2, 3, 4]));      // [24,12,8,6]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [0,0,9,0,0]
