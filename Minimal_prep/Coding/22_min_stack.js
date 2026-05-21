/**
 * Q22 | Min Stack (O(1) getMin)
 * Difficulty : Medium
 * Pattern    : Auxiliary stack
 * Companies  : Google, Microsoft
 *
 * PROBLEM:
 *   Design stack that supports push, pop, top, and getMin in O(1).
 *
 * APPROACH:
 *   Maintain two stacks: main stack and minStack.
 *   minStack tracks current minimum at each level.
 *   On push: push to main; push min(val, minStack.top) to minStack.
 *   On pop: pop both stacks.
 *
 * TIME: O(1) all ops  SPACE: O(n)
 */

class MinStack {
  constructor() {
    this.stack    = [];
    this.minStack = []; // tracks min at each level
  }

  push(val) {
    this.stack.push(val);
    const currentMin = this.minStack.length
      ? Math.min(val, this.minStack[this.minStack.length - 1])
      : val;
    this.minStack.push(currentMin);
  }

  pop() {
    this.stack.pop();
    this.minStack.pop();
  }

  top() {
    return this.stack[this.stack.length - 1];
  }

  getMin() {
    return this.minStack[this.minStack.length - 1];
  }
}

// --- Tests ---
const ms = new MinStack();
ms.push(-2); ms.push(0); ms.push(-3);
console.log(ms.getMin()); // -3
ms.pop();
console.log(ms.top());    // 0
console.log(ms.getMin()); // -2
