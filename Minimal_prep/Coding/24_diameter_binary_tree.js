/**
 * Q24 | Diameter of Binary Tree
 * Difficulty : Easy
 * Pattern    : DFS height
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Diameter = longest path between any two nodes (may not pass through root).
 *   Path length = number of edges.
 *
 * APPROACH:
 *   At each node: diameter candidate = leftHeight + rightHeight.
 *   Track global max. Return height = 1 + max(left, right) to parent.
 *
 * TIME: O(n)  SPACE: O(h)
 */

class TreeNode {
  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }
}

function diameterOfBinaryTree(root) {
  let maxDiam = 0;

  function height(node) {
    if (!node) return 0;
    const left  = height(node.left);
    const right = height(node.right);
    maxDiam = Math.max(maxDiam, left + right); // update diameter
    return 1 + Math.max(left, right);          // return height
  }

  height(root);
  return maxDiam;
}

// --- Tests ---
const t1 = new TreeNode(1,
  new TreeNode(2, new TreeNode(4), new TreeNode(5)),
  new TreeNode(3)
);
console.log(diameterOfBinaryTree(t1)); // 3
console.log(diameterOfBinaryTree(new TreeNode(1, new TreeNode(2)))); // 1
