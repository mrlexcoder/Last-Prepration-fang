/**
 * Q15 | Reverse a Linked List
 * Difficulty : Easy
 * Pattern    : Iterative (3 pointers)
 * Companies  : Amazon, Google, TCS
 *
 * PROBLEM:
 *   Reverse singly linked list. Return new head.
 *   1→2→3→4→5 → 5→4→3→2→1
 *
 * APPROACH:
 *   prev=null, curr=head
 *   Each step: save next, reverse link, advance both pointers.
 *
 * TIME: O(n)  SPACE: O(1)
 */

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr) {
    const next = curr.next; // save
    curr.next  = prev;      // reverse
    prev       = curr;      // advance
    curr       = next;
  }
  return prev; // new head
}

// helpers
const build = arr => arr.reduceRight((next, val) => new ListNode(val, next), null);
const toArr = head => { const r=[]; while(head){r.push(head.val);head=head.next;} return r; };

// --- Tests ---
console.log(toArr(reverseList(build([1,2,3,4,5])))); // [5,4,3,2,1]
console.log(toArr(reverseList(build([1,2]))));        // [2,1]
console.log(toArr(reverseList(null)));                // []
