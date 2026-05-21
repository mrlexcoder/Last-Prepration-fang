/**
 * Q27 | Validate BST
 * Difficulty : Medium
 * Pattern    : Min-max range (DFS)
 * Companies  : Amazon, Google, Microsoft
 *
 * PROBLEM:
 *   Return true if binary tree is a valid BST.
 *   BST: left < node < right, and this holds for ALL nodes.
 *
 * APPROACH:
 *   Pass min and max bounds down recursively.
 *   Left child: max bound = current node value.
 *   Right child: min bound = current node value.
 *
 * TIME: O(n)  SPACE: O(h)
 */

class TreeNode {
  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }
}

function isValidBST(root, min=-Infinity, max=Infinity) {
  if (!root) return true;
  if (root.val <= min || root.val >= max) return false;

  return isValidBST(root.left,  min, root.val) &&
         isValidBST(root.right, root.val, max);
}

// --- Tests ---
const t1 = new TreeNode(2, new TreeNode(1), new TreeNode(3));
console.log(isValidBST(t1)); // true

const t2 = new TreeNode(5,
  new TreeNode(1),
  new TreeNode(4, new TreeNode(3), new TreeNode(6))
);
console.log(isValidBST(t2)); // false (4 < 5 but is right child)
