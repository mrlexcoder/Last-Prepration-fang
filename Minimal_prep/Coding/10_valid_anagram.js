/**
 * Q10 | Valid Anagram
 * Difficulty : Easy
 * Pattern    : Frequency count
 * Companies  : Google, Microsoft, HCL
 *
 * PROBLEM:
 *   Return true if t is an anagram of s (same chars, same counts).
 *
 * APPROACH:
 *   Count char frequencies in s (increment), then check against t (decrement).
 *   If any count goes negative → false.
 *
 * TIME: O(n)  SPACE: O(1) — at most 26 keys
 */

function isAnagram(s, t) {
  if (s.length !== t.length) return false;

  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  for (const ch of t) {
    if (!freq[ch]) return false;
    freq[ch]--;
  }
  return true;
}

// --- Tests ---
console.log(isAnagram("anagram", "nagaram")); // true
console.log(isAnagram("rat", "car"));         // false
console.log(isAnagram("listen", "silent"));   // true
