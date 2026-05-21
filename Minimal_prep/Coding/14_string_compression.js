/**
 * Q14 | String Compression / Run-Length Encoding
 * Difficulty : Easy
 * Pattern    : Counting pass
 * Companies  : TCS, Wipro, Accenture
 *
 * PROBLEM:
 *   Compress string using counts of repeated characters.
 *   "aabcccccaaa" → "a2b1c5a3"
 *   If compressed is not smaller, return original.
 *
 * APPROACH:
 *   Walk through string, count consecutive same chars.
 *   Append char + count to result.
 *
 * TIME: O(n)  SPACE: O(n)
 */

function compress(s) {
  let result = "";
  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    let count = 0;

    // count consecutive same characters
    while (i < s.length && s[i] === ch) {
      count++;
      i++;
    }

    result += ch + count;
  }

  return result.length < s.length ? result : s;
}

// --- Tests ---
console.log(compress("aabcccccaaa")); // "a2b1c5a3"
console.log(compress("abcdef"));      // "abcdef" (no compression benefit)
console.log(compress("aabb"));        // "aabb"   (a2b2 same length)
console.log(compress("aaaa"));        // "a4"
