/**
 * Q35 | Coin Change (Minimum Coins)
 * Difficulty : Medium
 * Pattern    : DP (Unbounded Knapsack)
 * Companies  : Amazon, Google, Microsoft
 *
 * PROBLEM:
 *   Given coins and amount, return fewest coins to make amount. -1 if impossible.
 *
 * APPROACH:
 *   dp[i] = min coins to make amount i.
 *   dp[0] = 0. For each amount, try every coin.
 *   dp[i] = min(dp[i], dp[i - coin] + 1)
 *
 * TIME: O(amount * coins)  SPACE: O(amount)
 */

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}

// --- Tests ---
console.log(coinChange([1,2,5], 11)); // 3  (5+5+1)
console.log(coinChange([2], 3));      // -1
console.log(coinChange([1], 0));      // 0
