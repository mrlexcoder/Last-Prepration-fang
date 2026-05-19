/**
 * LC-121 | Best Time to Buy & Sell Stock
 * Difficulty : Easy
 * Pattern    : Greedy — track minimum price seen so far
 * Companies  : Amazon, Meta, Google
 *
 * PROBLEM:
 *   Given an array `prices` where prices[i] is the price on day i,
 *   return the maximum profit you can achieve from ONE buy + ONE sell.
 *   You must buy before you sell. Return 0 if no profit is possible.
 *
 * APPROACH:
 *   - Keep track of the minimum price seen so far (best day to buy).
 *   - At each day, calculate profit = currentPrice - minPrice.
 *   - Update maxProfit if this profit is better.
 *   - Single pass → O(n) time, O(1) space.
 *
 * EXAMPLE:
 *   prices = [7, 1, 5, 3, 6, 4]
 *   Day 0: min=7, profit=0
 *   Day 1: min=1, profit=0
 *   Day 2: min=1, profit=5-1=4  ← new max
 *   Day 3: min=1, profit=3-1=2
 *   Day 4: min=1, profit=6-1=5  ← new max
 *   Day 5: min=1, profit=4-1=3
 *   Answer: 5
 */

function maxProfit(prices) {
  let minPrice = Infinity; // best price to buy
  let maxProfit = 0;       // best profit so far

  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;          // found a cheaper buy day
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice; // found a better sell day
    }
  }

  return maxProfit;
}

// --- Tests ---
console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 5  (buy@1, sell@6)
console.log(maxProfit([7, 6, 4, 3, 1]));     // 0  (prices only fall)
console.log(maxProfit([1, 2]));               // 1
console.log(maxProfit([2, 4, 1]));            // 2  (buy@2, sell@4)
