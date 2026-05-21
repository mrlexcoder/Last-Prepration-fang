/**
 * Q16 | Detect Cycle in Linked List (Floyd's Algorithm)
 * Difficulty : Easy
 * Pattern    : Slow-fast pointers
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Return true if linked list has a cycle.
 *
 * APPROACH (Floyd's Tortoise & Hare):
 *   slow moves 1 step, fast moves 2 steps.
 *   If they meet → cycle exists.
 *   If fast reaches null → no cycle.
 *
 * TIME: O(n)  SPACE: O(1)
 */

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function hasCycle(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;       // 1 step
    fast = fast.next.next;  // 2 steps
    if (slow === fast) return true; // met → cycle
  }
  return false;
}

// --- Tests ---
// Build: 3→2→0→-4→(back to node 2)
const n1 = new ListNode(3);
const n2 = new ListNode(2);
const n3 = new ListNode(0);
const n4 = new ListNode(-4);
n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2; // cycle
console.log(hasCycle(n1)); // true

// No cycle: 1→2
const a = new ListNode(1);
const b = new ListNode(2);
a.next = b;
console.log(hasCycle(a)); // false
