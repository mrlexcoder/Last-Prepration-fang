/**
 * LC-20 | Valid Parentheses
 * Difficulty : Easy
 * Pattern    : Stack
 * Companies  : Google, Amazon, Meta, Microsoft, Accenture
 * Must-Do    : Yes
 *
 * PROBLEM:
 *   Given a string s containing '(', ')', '{', '}', '[', ']',
 *   determine if the input string is valid.
 *   Valid means:
 *     1. Open brackets closed by the same type of bracket
 *     2. Open brackets closed in the correct order
 *     3. Every close bracket has a corresponding open bracket
 *
 * APPROACH:
 *   - Use a stack
 *   - Push every opening bracket onto the stack
 *   - On closing bracket: check if top of stack is the matching opener
 *     → if yes: pop it
 *     → if no (or stack empty): return false
 *   - At the end: stack must be empty (all opened brackets were closed)
 *   - O(n) time, O(n) space
 *
 * EXAMPLE:
 *   s = "({[]})"
 *   '(' → push  → stack: ['(']
 *   '{' → push  → stack: ['(', '{']
 *   '[' → push  → stack: ['(', '{', '[']
 *   ']' → top='[' matches → pop → stack: ['(', '{']
 *   '}' → top='{' matches → pop → stack: ['(']
 *   ')' → top='(' matches → pop → stack: []
 *   stack empty → true ✓
 *
 *   s = "([)]"
 *   '(' → push → stack: ['(']
 *   '[' → push → stack: ['(', '[']
 *   ')' → top='[' does NOT match ')' → false ✓
 */

function isValid(s) {
  const stack = [];
  const match = { ")": "(", "}": "{", "]": "[" };

  for (const ch of s) {
    if (ch === "(" || ch === "{" || ch === "[") {
      stack.push(ch); // opening bracket → push
    } else {
      // closing bracket → must match top of stack
      if (stack.pop() !== match[ch]) return false;
    }
  }

  return stack.length === 0; // all brackets must be closed
}

// --- Tests ---
console.log(isValid("()"));       // true
console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));       // false
console.log(isValid("([)]"));     // false
console.log(isValid("{[]}"));     // true
console.log(isValid(""));         // true
console.log(isValid("("));        // false  (unclosed)
