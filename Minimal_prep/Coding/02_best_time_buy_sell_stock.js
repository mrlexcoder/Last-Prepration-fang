/**
 * Q2 | Best Time to Buy & Sell Stock (I & II)
 * Difficulty : Easy
 * Pattern    : Greedy / single-pass
 * Companies  : Amazon, Microsoft, Infosys
 *
 * PART I  — one transaction only → max profit
 * PART II — unlimited transactions → sum all upward slopes
 *
 * TIME: O(n)  SPACE: O(1)
 */

// Part I: single buy + sell
function maxProfitI(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const p of prices) {
    minPrice  = Math.min(minPrice, p);
    maxProfit = Math.max(maxProfit, p - minPrice);
  }
  return maxProfit;
}

// Part II: buy & sell on every upward day
function maxProfitII(prices) {
  let profit = 0;
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1])
      profit += prices[i] - prices[i - 1]; // grab every gain
  }
  return profit;
}

// --- Tests ---
console.log(maxProfitI([7, 1, 5, 3, 6, 4]));  // 5
console.log(maxProfitI([7, 6, 4, 3, 1]));      // 0
console.log(maxProfitII([7, 1, 5, 3, 6, 4])); // 7
console.log(maxProfitII([1, 2, 3, 4, 5]));    // 4
