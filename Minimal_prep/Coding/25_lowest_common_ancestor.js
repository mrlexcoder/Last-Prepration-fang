/**
 * Q25 | Lowest Common Ancestor of Binary Tree
 * Difficulty : Medium
 * Pattern    : Recursive DFS
 * Companies  : Google, Microsoft
 *
 * PROBLEM:
 *   Find LCA of nodes p and q in binary tree.
 *   LCA = deepest node that has both p and q as descendants.
 *
 * APPROACH:
 *   If current node is null, p, or q → return it.
 *   Recurse left and right.
 *   If both sides return non-null → current node is LCA.
 *   If only one side → that side has both nodes, return it.
 *
 * TIME: O(n)  SPACE: O(h)
 */

class TreeNode {
  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }
}

function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root;

  const left  = lowestCommonAncestor(root.left,  p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root; // p and q on different sides
  return left || right;           // both on same side
}

// --- Tests ---
const n3=new TreeNode(3), n5=new TreeNode(5), n1=new TreeNode(1);
const n6=new TreeNode(6), n2=new TreeNode(2), n0=new TreeNode(0), n8=new TreeNode(8);
const n7=new TreeNode(7), n4=new TreeNode(4);
n3.left=n5; n3.right=n1; n5.left=n6; n5.right=n2; n1.left=n0; n1.right=n8;
n2.left=n7; n2.right=n4;

console.log(lowestCommonAncestor(n3, n5, n1).val); // 3
console.log(lowestCommonAncestor(n3, n5, n4).val); // 5
