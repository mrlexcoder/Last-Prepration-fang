/**
 * Q12 | Longest Palindromic Substring
 * Difficulty : Medium
 * Pattern    : Expand around centre
 * Companies  : Amazon, Microsoft
 *
 * PROBLEM:
 *   Find the longest palindromic substring in s.
 *   "babad" → "bab" or "aba"
 *
 * APPROACH:
 *   For each character (and gap between chars), expand outward while chars match.
 *   Two cases: odd-length (centre = single char), even-length (centre = two chars).
 *
 * TIME: O(n²)  SPACE: O(1)
 */

function longestPalindrome(s) {
  let start = 0, maxLen = 1;

  function expand(lo, hi) {
    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {
      if (hi - lo + 1 > maxLen) {
        maxLen = hi - lo + 1;
        start  = lo;
      }
      lo--; hi++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // odd length
    expand(i, i + 1); // even length
  }

  return s.substring(start, start + maxLen);
}

// --- Tests ---
console.log(longestPalindrome("babad"));   // "bab"
console.log(longestPalindrome("cbbd"));    // "bb"
console.log(longestPalindrome("a"));       // "a"
console.log(longestPalindrome("racecar")); // "racecar"
