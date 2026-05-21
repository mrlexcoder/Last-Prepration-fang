/**
 * Q36 | Word Break Problem
 * Difficulty : Medium
 * Pattern    : DP + HashSet
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Given string s and dictionary wordDict, return true if s can be
 *   segmented into dictionary words.
 *   s="leetcode", dict=["leet","code"] → true
 *
 * APPROACH:
 *   dp[i] = true if s[0..i-1] can be segmented.
 *   dp[0] = true (empty string).
 *   For each position i, check all j < i:
 *     if dp[j] is true AND s[j..i-1] is in dict → dp[i] = true.
 *
 * TIME: O(n²)  SPACE: O(n)
 */

function wordBreak(s, wordDict) {
  const wordSet = new Set(wordDict);
  const dp = new Array(s.length + 1).fill(false);
  dp[0] = true; // empty prefix always valid

  for (let i = 1; i <= s.length; i++) {
    for (let j = 0; j < i; j++) {
      if (dp[j] && wordSet.has(s.slice(j, i))) {
        dp[i] = true;
        break; // no need to check further
      }
    }
  }
  return dp[s.length];
}

// --- Tests ---
console.log(wordBreak("leetcode",  ["leet","code"]));          // true
console.log(wordBreak("applepenapple", ["apple","pen"]));      // true
console.log(wordBreak("catsandog", ["cats","dog","sand","and","cat"])); // false
