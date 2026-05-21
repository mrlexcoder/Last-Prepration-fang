/**
 * Q34 | Longest Common Subsequence (LCS)
 * Difficulty : Medium
 * Pattern    : 2-D DP
 * Companies  : Amazon, Google, Adobe
 *
 * PROBLEM:
 *   Find length of longest subsequence common to both strings.
 *   "abcde" + "ace" → 3 ("ace")
 *
 * APPROACH:
 *   dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]
 *   If chars match: dp[i][j] = dp[i-1][j-1] + 1
 *   Else:           dp[i][j] = max(dp[i-1][j], dp[i][j-1])
 *
 * TIME: O(m*n)  SPACE: O(m*n)
 */

function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array.from({ length: m+1 }, () => new Array(n+1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i-1] === text2[j-1]) {
        dp[i][j] = dp[i-1][j-1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
      }
    }
  }
  return dp[m][n];
}

// --- Tests ---
console.log(longestCommonSubsequence("abcde", "ace"));   // 3
console.log(longestCommonSubsequence("abc", "abc"));     // 3
console.log(longestCommonSubsequence("abc", "def"));     // 0
