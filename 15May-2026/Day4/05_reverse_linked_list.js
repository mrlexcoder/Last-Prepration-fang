/**
 * LC-206 | Reverse Linked List
 * Difficulty : Easy
 * Pattern    : Pointer Manipulation (Iterative)
 * Companies  : Amazon, Google, Microsoft, Meta, TCS
 * Must-Do    : Yes
 *
 * PROBLEM:
 *   Given the head of a singly linked list, reverse the list
 *   and return the reversed list's head.
 *
 * APPROACH — Iterative (3 pointers):
 *   prev = null, curr = head
 *   At each step:
 *     1. Save next = curr.next
 *     2. Point curr.next → prev  (reverse the link)
 *     3. Move prev → curr
 *     4. Move curr → next
 *   When curr is null, prev is the new head.
 *   O(n) time, O(1) space
 *
 * EXAMPLE:
 *   1 → 2 → 3 → 4 → 5 → null
 *
 *   prev=null, curr=1
 *   step1: next=2, 1→null, prev=1, curr=2
 *   step2: next=3, 2→1,    prev=2, curr=3
 *   step3: next=4, 3→2,    prev=3, curr=4
 *   step4: next=5, 4→3,    prev=4, curr=5
 *   step5: next=null,5→4,  prev=5, curr=null
 *   return prev=5
 *   Result: 5 → 4 → 3 → 2 → 1 → null ✓
 */

class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function reverseList(head) {
  let prev = null;
  let curr = head;

  while (curr !== null) {
    const next = curr.next; // save next
    curr.next = prev;       // reverse link
    prev = curr;            // move prev forward
    curr = next;            // move curr forward
  }

  return prev; // new head
}

// --- Helper: build list from array ---
function buildList(arr) {
  let head = null;
  for (let i = arr.length - 1; i >= 0; i--) {
    head = new ListNode(arr[i], head);
  }
  return head;
}

// --- Helper: list to array for printing ---
function listToArray(head) {
  const result = [];
  while (head) {
    result.push(head.val);
    head = head.next;
  }
  return result;
}

// --- Tests ---
console.log(listToArray(reverseList(buildList([1, 2, 3, 4, 5])))); // [5,4,3,2,1]
console.log(listToArray(reverseList(buildList([1, 2]))));           // [2,1]
console.log(listToArray(reverseList(buildList([]))));               // []
console.log(listToArray(reverseList(buildList([1]))));              // [1]
