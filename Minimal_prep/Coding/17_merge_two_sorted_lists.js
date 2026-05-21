/**
 * Q17 | Merge Two Sorted Lists
 * Difficulty : Easy
 * Pattern    : Merge routine (dummy node)
 * Companies  : Microsoft, Infosys
 *
 * PROBLEM:
 *   Merge two sorted linked lists and return sorted merged list.
 *   1→2→4  +  1→3→4  →  1→1→2→3→4→4
 *
 * APPROACH:
 *   Use a dummy head node. Compare l1 and l2 values.
 *   Attach smaller node to result, advance that pointer.
 *   Attach remaining list at end.
 *
 * TIME: O(m+n)  SPACE: O(1)
 */

class ListNode {
  constructor(val, next = null) { this.val = val; this.next = next; }
}

function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let curr = dummy;

  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else                  { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }

  curr.next = l1 || l2; // attach remaining
  return dummy.next;
}

const build = arr => arr.reduceRight((next, val) => new ListNode(val, next), null);
const toArr = head => { const r=[]; while(head){r.push(head.val);head=head.next;} return r; };

// --- Tests ---
console.log(toArr(mergeTwoLists(build([1,2,4]), build([1,3,4])))); // [1,1,2,3,4,4]
console.log(toArr(mergeTwoLists(null, null)));                      // []
console.log(toArr(mergeTwoLists(null, build([0]))));                // [0]
