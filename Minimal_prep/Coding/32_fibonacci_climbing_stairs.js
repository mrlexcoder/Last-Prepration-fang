/**
 * Q32 | Fibonacci / Climbing Stairs
 * Difficulty : Easy
 * Pattern    : DP memoisation
 * Companies  : TCS, Infosys, Wipro
 *
 * PART A — Fibonacci with memoisation
 * PART B — Climbing Stairs (same recurrence: ways(n) = ways(n-1) + ways(n-2))
 *
 * TIME: O(n)  SPACE: O(1) for iterative
 */

// Fibonacci — iterative O(1) space
function fib(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
}

// Climbing Stairs — same pattern
function climbStairs(n) {
  if (n <= 2) return n;
  let prev2 = 1, prev1 = 2;
  for (let i = 3; i <= n; i++) {
    const curr = prev1 + prev2;
    prev2 = prev1;
    prev1 = curr;
  }
  return prev1;
}

// Fibonacci with memoisation (top-down)
function fibMemo(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return memo[n] = fibMemo(n-1, memo) + fibMemo(n-2, memo);
}

// --- Tests ---
console.log([0,1,2,3,4,5,6,7,8,9,10].map(fib));       // [0,1,1,2,3,5,8,13,21,34,55]
console.log(climbStairs(5));  // 8
console.log(climbStairs(10)); // 89
console.log(fibMemo(10));     // 55
