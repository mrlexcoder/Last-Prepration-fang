/**
 * Q20 | Valid Parentheses
 * Difficulty : Easy
 * Pattern    : Stack
 * Companies  : Amazon, Google, Adobe
 *
 * PROBLEM:
 *   Return true if brackets are correctly opened and closed.
 *
 * APPROACH:
 *   Push opening brackets. On closing bracket, pop and check match.
 *   Stack must be empty at end.
 *
 * TIME: O(n)  SPACE: O(n)
 */

function isValid(s) {
  const stack = [];
  const match = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if ("({[".includes(ch)) {
      stack.push(ch);
    } else {
      if (stack.pop() !== match[ch]) return false;
    }
  }
  return stack.length === 0;
}

// --- Tests ---
console.log(isValid("()"));       // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));       // false
console.log(isValid("([)]"));     // false
console.log(isValid("{[]}"));     // true
