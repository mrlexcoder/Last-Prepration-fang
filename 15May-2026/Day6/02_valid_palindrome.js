/**
 * LC-125 | Valid Palindrome
 * Difficulty : Easy
 * Pattern    : Two Pointers
 * Companies  : Meta, Amazon, Microsoft
 *
 * PROBLEM:
 *   A phrase is a palindrome if, after converting all uppercase letters to
 *   lowercase and removing all non-alphanumeric characters, it reads the
 *   same forward and backward.
 *   Given a string s, return true if it is a palindrome.
 *
 * APPROACH:
 *   - Use two pointers: lo at start, hi at end
 *   - Skip non-alphanumeric characters on both sides
 *   - Compare characters (case-insensitive)
 *   - If mismatch → false, if pointers cross → true
 *   - O(n) time, O(1) space (no extra string created)
 *
 * EXAMPLE:
 *   s = "A man, a plan, a canal: Panama"
 *   cleaned view: "amanaplanacanalpanama"
 *   lo=0(a), hi=29(a) → match → move both
 *   lo=1(m), hi=28(m) → match → ...
 *   → all match → true ✓
 *
 *   s = "race a car"
 *   cleaned: "raceacar"
 *   lo=0(r), hi=7(r) → match
 *   lo=1(a), hi=6(a) → match
 *   lo=2(c), hi=5(c) → match
 *   lo=3(e), hi=4(a) → MISMATCH → false ✓
 */

function isPalindrome(s) {
  let lo = 0;
  let hi = s.length - 1;

  while (lo < hi) {
    // skip non-alphanumeric from left
    while (lo < hi && !isAlphanumeric(s[lo])) lo++;
    // skip non-alphanumeric from right
    while (lo < hi && !isAlphanumeric(s[hi])) hi--;

    if (s[lo].toLowerCase() !== s[hi].toLowerCase()) return false;

    lo++;
    hi--;
  }

  return true;
}

function isAlphanumeric(ch) {
  return /[a-zA-Z0-9]/.test(ch);
}

// --- Tests ---
console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car"));                     // false
console.log(isPalindrome(" "));                              // true
console.log(isPalindrome("Was it a car or a cat I saw?"));   // true
console.log(isPalindrome("0P"));                             // false
