/**
 * LC-322 | Coin Change
 * Difficulty : Medium
 * Pattern    : Dynamic Programming (Unbounded Knapsack)
 * Companies  : Amazon, Google, Meta, Microsoft, Uber
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given coins of different denominations and a total amount,
 *   return the fewest number of coins needed to make up that amount.
 *   Return -1 if it cannot be made up by any combination.
 *
 * APPROACH:
 *   - dp[i] = minimum coins needed to make amount i
 *   - dp[0] = 0 (0 coins to make amount 0)
 *   - dp[i] = min(dp[i], dp[i - coin] + 1) for each coin
 *   - Initialize dp with Infinity (impossible)
 *   - O(amount * coins) time, O(amount) space
 *
 * EXAMPLE:
 *   coins=[1,2,5], amount=11
 *
 *   dp[0]=0
 *   dp[1]=min(∞, dp[0]+1)=1        (use coin 1)
 *   dp[2]=min(∞, dp[1]+1, dp[0]+1)=1  (use coin 2)
 *   dp[3]=min(∞, dp[2]+1, dp[1]+1)=2  (1+2)
 *   dp[4]=min(∞, dp[3]+1, dp[2]+1)=2  (2+2)
 *   dp[5]=min(∞, dp[4]+1, dp[3]+1, dp[0]+1)=1  (use coin 5)
 *   ...
 *   dp[11]=3  (5+5+1) ✓
 */

function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (coin <= i && dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1;
      }
    }
  }

  return dp[amount] === Infinity ? -1 : dp[amount];
}

// --- Tests ---
console.log(coinChange([1, 2, 5], 11));  // 3  (5+5+1)
console.log(coinChange([2], 3));          // -1 (impossible)
console.log(coinChange([1], 0));          // 0
console.log(coinChange([1], 2));          // 2
console.log(coinChange([2, 5, 10, 1], 27)); // 4 (10+10+5+2)
