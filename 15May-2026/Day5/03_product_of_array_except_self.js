/**
 * LC-238 | Product of Array Except Self
 * Difficulty : Medium
 * Pattern    : Prefix Products (no division allowed)
 * Companies  : Amazon, Meta, Google, Microsoft, Apple
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given an integer array `nums`, return an array `answer` where
 *   answer[i] = product of all elements EXCEPT nums[i].
 *   Solve in O(n) time WITHOUT using the division operator.
 *
 * APPROACH — Two-pass prefix/suffix products:
 *
 *   Pass 1 (left prefix):
 *     answer[i] = product of all elements to the LEFT of i
 *     answer[0] = 1 (nothing to the left)
 *
 *   Pass 2 (right suffix, in-place):
 *     Maintain a running `right` variable.
 *     Multiply answer[i] by `right`, then update right *= nums[i].
 *
 *   This avoids a separate suffix array → O(1) extra space.
 *
 * EXAMPLE:
 *   nums    = [1,  2,  3,  4]
 *
 *   After left pass:
 *   answer  = [1,  1,  2,  6]
 *              ↑   ↑   ↑   ↑
 *             1  1*1 1*2 1*2*3
 *
 *   Right pass (right starts at 1):
 *   i=3: answer[3] = 6*1=6,  right = 1*4=4
 *   i=2: answer[2] = 2*4=8,  right = 4*3=12
 *   i=1: answer[1] = 1*12=12,right = 12*2=24
 *   i=0: answer[0] = 1*24=24,right = 24*1=24
 *
 *   Final: [24, 12, 8, 6] ✓
 */

function productExceptSelf(nums) {
  const n = nums.length;
  const answer = new Array(n).fill(1);

  // Pass 1: fill answer[i] with product of all elements LEFT of i
  let left = 1;
  for (let i = 0; i < n; i++) {
    answer[i] = left;
    left *= nums[i];
  }

  // Pass 2: multiply answer[i] by product of all elements RIGHT of i
  let right = 1;
  for (let i = n - 1; i >= 0; i--) {
    answer[i] *= right;
    right *= nums[i];
  }

  return answer;
}

// --- Tests ---
console.log(productExceptSelf([1, 2, 3, 4]));    // [24, 12, 8, 6]
console.log(productExceptSelf([-1, 1, 0, -3, 3])); // [0, 0, 9, 0, 0]
console.log(productExceptSelf([2, 3]));           // [3, 2]
