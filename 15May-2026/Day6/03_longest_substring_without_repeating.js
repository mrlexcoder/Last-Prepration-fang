/**
 * LC-3 | Longest Substring Without Repeating Characters
 * Difficulty : Medium
 * Pattern    : Sliding Window + HashSet
 * Companies  : Amazon, Google, Meta, Microsoft, Adobe
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given a string s, find the length of the longest substring
 *   that contains no repeating characters.
 *
 * APPROACH — Sliding Window:
 *   - Maintain a window [lo, hi] with a Set of current characters
 *   - Expand hi: add s[hi] to the Set
 *   - If s[hi] already in Set → shrink from lo until duplicate removed
 *   - Track max window size throughout
 *   - O(n) time, O(min(n, alphabet)) space
 *
 * EXAMPLE:
 *   s = "abcabcbb"
 *
 *   hi=0: add 'a' → set={a},       window=1, max=1
 *   hi=1: add 'b' → set={a,b},     window=2, max=2
 *   hi=2: add 'c' → set={a,b,c},   window=3, max=3
 *   hi=3: 'a' in set → remove s[lo=0]='a', lo=1
 *         add 'a' → set={b,c,a},   window=3, max=3
 *   hi=4: 'b' in set → remove s[lo=1]='b', lo=2
 *         add 'b' → set={c,a,b},   window=3, max=3
 *   hi=5: 'c' in set → remove s[lo=2]='c', lo=3
 *         add 'c' → set={a,b,c},   window=3, max=3
 *   hi=6: 'b' in set → remove s[lo=3]='a', lo=4
 *         'b' still in set → remove s[lo=4]='b', lo=5
 *         add 'b' → set={c,b},     window=2, max=3
 *   hi=7: 'b' in set → remove s[lo=5]='c', lo=6
 *         'b' still in set → remove s[lo=6]='b', lo=7
 *         add 'b' → set={b},       window=1, max=3
 *   Answer: 3 ("abc") ✓
 */

function lengthOfLongestSubstring(s) {
  const seen = new Set();
  let lo = 0;
  let max = 0;

  for (let hi = 0; hi < s.length; hi++) {
    // shrink window from left until no duplicate
    while (seen.has(s[hi])) {
      seen.delete(s[lo]);
      lo++;
    }

    seen.add(s[hi]);
    max = Math.max(max, hi - lo + 1);
  }

  return max;
}

// --- Tests ---
console.log(lengthOfLongestSubstring("abcabcbb")); // 3 → "abc"
console.log(lengthOfLongestSubstring("bbbbb"));    // 1 → "b"
console.log(lengthOfLongestSubstring("pwwkew"));   // 3 → "wke"
console.log(lengthOfLongestSubstring(""));         // 0
console.log(lengthOfLongestSubstring("dvdf"));     // 3 → "vdf"
