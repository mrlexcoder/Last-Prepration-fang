/**
 * Q11 | Longest Substring Without Repeating Characters
 * Difficulty : Medium
 * Pattern    : Sliding window
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Find length of longest substring with all unique characters.
 *
 * APPROACH:
 *   Sliding window [lo, hi]. Expand hi, shrink lo when duplicate found.
 *   Use Set to track chars in current window.
 *
 * TIME: O(n)  SPACE: O(min(n, alphabet))
 */

function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let lo = 0, max = 0;

  for (let hi = 0; hi < s.length; hi++) {
    while (seen.has(s[hi])) {
      seen.delete(s[lo++]); // shrink from left
    }
    seen.add(s[hi]);
    max = Math.max(max, hi - lo + 1);
  }
  return max;
}

// --- Tests ---
console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb"));    // 1
console.log(lengthOfLongestSubstring("pwwkew"));   // 3
console.log(lengthOfLongestSubstring(""));         // 0
