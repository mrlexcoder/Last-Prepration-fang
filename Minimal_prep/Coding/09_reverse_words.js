/**
 * Q9 | Reverse Words in a String
 * Difficulty : Easy
 * Pattern    : Split & reverse
 * Companies  : Amazon, Infosys, TCS
 *
 * PROBLEM:
 *   Given string s, reverse the order of words.
 *   "  the sky  is blue  " → "blue is sky the"
 *   (trim leading/trailing spaces, single space between words)
 *
 * APPROACH:
 *   Split by whitespace (handles multiple spaces), filter empty strings,
 *   reverse array, join with single space.
 *
 * TIME: O(n)  SPACE: O(n)
 */

function reverseWords(s) {
  return s
    .trim()
    .split(/\s+/)   // split on one or more spaces
    .reverse()
    .join(" ");
}

// --- Tests ---
console.log(reverseWords("the sky is blue"));      // "blue is sky the"
console.log(reverseWords("  hello world  "));      // "world hello"
console.log(reverseWords("a good   example"));     // "example good a"
