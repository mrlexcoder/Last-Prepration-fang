/**
 * Q18 | Find Middle of Linked List
 * Difficulty : Easy
 * Pattern    : Slow-fast pointer
 * Companies  : TCS, Cognizant, HCL
 *
 * PROBLEM:
 *   Return middle node of linked list.
 *   If two middles, return second one.
 *   1→2→3→4→5 → node(3)
 *   1→2→3→4   → node(3)
 *
 * APPROACH:
 *   slow moves 1 step, fast moves 2 steps.
 *   When fast reaches end, slow is at middle.
 *
 * TIME: O(n)  SPACE: O(1)
 */

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function middleNode(head) {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

const build = arr => arr.reduceRight((next, val) => new ListNode(val, next), null);
const toArr = head => { const r=[]; while(head){r.push(head.val);head=head.next;} return r; };

// --- Tests ---
console.log(toArr(middleNode(build([1,2,3,4,5])))); // [3,4,5]
console.log(toArr(middleNode(build([1,2,3,4]))));   // [3,4]
console.log(toArr(middleNode(build([1]))));          // [1]
