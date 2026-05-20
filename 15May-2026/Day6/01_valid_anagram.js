/**
 * LC-242 | Valid Anagram
 * Difficulty : Easy
 * Pattern    : HashMap / Frequency Count
 * Companies  : Amazon, Google, Microsoft, TCS
 *
 * PROBLEM:
 *   Given two strings s and t, return true if t is an anagram of s.
 *   An anagram uses the same characters the same number of times.
 *
 * APPROACH:
 *   - If lengths differ → false immediately
 *   - Count frequency of each character in s (increment)
 *   - For each character in t, decrement its count
 *   - If any count goes below 0 → t has a char s doesn't → false
 *   - O(n) time, O(1) space (at most 26 keys)
 *
 * EXAMPLE:
 *   s = "anagram", t = "nagaram"
 *   freq after s: {a:3, n:1, g:1, r:1, m:1}
 *   process t:    {a:3→2→1→0, n:0, g:0, r:0, m:0} → all zero → true ✓
 *
 *   s = "rat", t = "car"
 *   freq after s: {r:1, a:1, t:1}
 *   process t: c → not in map → count=-1 → false ✓
 */

function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const freq = {};

  // count characters in s
  for (const ch of s) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  // subtract characters in t
  for (const ch of t) {
    if (!freq[ch]) return false; // char missing or already used up
    freq[ch]--;
  }

  return true;
}

// --- Tests ---
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));         // false
console.log(isAnagram("a", "a"));             // true
console.log(isAnagram("ab", "a"));            // false
console.log(isAnagram("listen", "silent"));   // true
