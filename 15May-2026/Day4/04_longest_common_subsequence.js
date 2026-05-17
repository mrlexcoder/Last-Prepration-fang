/**
 * LC-1143 | Longest Common Subsequence
 * Difficulty : Medium
 * Pattern    : 2D Dynamic Programming
 * Companies  : Amazon, Google, Meta, Microsoft, Adobe
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given two strings text1 and text2, return the length of their
 *   longest common subsequence (LCS).
 *   A subsequence is a sequence derived by deleting some characters
 *   without changing the relative order.
 *   Return 0 if no common subsequence exists.
 *
 * APPROACH:
 *   dp[i][j] = LCS length of text1[0..i-1] and text2[0..j-1]
 *
 *   If text1[i-1] === text2[j-1]:
 *     dp[i][j] = dp[i-1][j-1] + 1   (characters match, extend LCS)
 *   Else:
 *     dp[i][j] = max(dp[i-1][j], dp[i][j-1])  (skip one char from either)
 *
 *   O(m*n) time, O(m*n) space
 *
 * EXAMPLE:
 *   text1="abcde", text2="ace"
 *
 *       ""  a  c  e
 *   ""  [0, 0, 0, 0]
 *   a   [0, 1, 1, 1]
 *   b   [0, 1, 1, 1]
 *   c   [0, 1, 2, 2]
 *   d   [0, 1, 2, 2]
 *   e   [0, 1, 2, 3]  ← answer = 3 ("ace") ✓
 */

function longestCommonSubsequence(text1, text2) {
  const m = text1.length;
  const n = text2.length;

  // dp table with extra row/col of zeros for base case
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; // characters match
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]); // take best
      }
    }
  }

  return dp[m][n];
}

// --- Tests ---
console.log(longestCommonSubsequence("abcde", "ace"));   // 3
console.log(longestCommonSubsequence("abc", "abc"));     // 3
console.log(longestCommonSubsequence("abc", "def"));     // 0
console.log(longestCommonSubsequence("bl", "yby"));      // 1
console.log(longestCommonSubsequence("oxcpqrsvwf", "shmtulqrypy")); // 2
