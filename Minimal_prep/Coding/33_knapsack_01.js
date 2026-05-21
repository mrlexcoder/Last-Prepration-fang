/**
 * Q33 | 0-1 Knapsack Problem
 * Difficulty : Medium
 * Pattern    : 2-D DP table
 * Companies  : Amazon, Capgemini, TCS
 *
 * PROBLEM:
 *   Given weights[], values[], and capacity W.
 *   Pick items (each at most once) to maximise total value without exceeding W.
 *
 * APPROACH:
 *   dp[i][w] = max value using first i items with capacity w.
 *   For each item i:
 *     Skip item:  dp[i][w] = dp[i-1][w]
 *     Take item:  dp[i][w] = dp[i-1][w-weight[i]] + value[i]  (if weight fits)
 *   Take max of both.
 *
 * TIME: O(n*W)  SPACE: O(n*W)
 */

function knapsack(weights, values, W) {
  const n  = weights.length;
  const dp = Array.from({ length: n+1 }, () => new Array(W+1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      dp[i][w] = dp[i-1][w]; // skip item i
      if (weights[i-1] <= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1]);
      }
    }
  }
  return dp[n][W];
}

// --- Tests ---
console.log(knapsack([1,3,4,5], [1,4,5,7], 7)); // 9
console.log(knapsack([2,3,4,5], [3,4,5,6], 5)); // 7
console.log(knapsack([1,2,3],   [6,10,12], 5)); // 22
