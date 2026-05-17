/**
 * LC-70 | Climbing Stairs
 * Difficulty : Easy
 * Pattern    : Dynamic Programming (Fibonacci)
 * Companies  : Amazon, Google, Microsoft, TCS, Wipro
 * Must-Do    : Yes
 *
 * PROBLEM:
 *   You are climbing a staircase with n steps.
 *   Each time you can climb 1 or 2 steps.
 *   In how many distinct ways can you climb to the top?
 *
 * APPROACH:
 *   - To reach step n, you came from step n-1 (1 step) or n-2 (2 steps)
 *   - So ways(n) = ways(n-1) + ways(n-2)  ← exactly Fibonacci!
 *   - Base cases: ways(1)=1, ways(2)=2
 *   - Use two variables instead of full array → O(1) space
 *   - O(n) time, O(1) space
 *
 * EXAMPLE:
 *   n=4:
 *   step 1: prev2=1, prev1=2
 *   step 3: curr = 1+2 = 3  → prev2=2, prev1=3
 *   step 4: curr = 2+3 = 5  → answer = 5
 *
 *   Ways for n=4: [1,1,1,1] [1,1,2] [1,2,1] [2,1,1] [2,2] → 5 ✓
 */

function climbStairs(n) {
  if (n <= 2) return n;

  let prev2 = 1; // ways to reach step 1
  let prev1 = 2; // ways to reach step 2

  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }

  return prev1;
}

// --- Tests ---
console.log(climbStairs(1));  // 1
console.log(climbStairs(2));  // 2
console.log(climbStairs(3));  // 3
console.log(climbStairs(4));  // 5
console.log(climbStairs(5));  // 8
console.log(climbStairs(10)); // 89
