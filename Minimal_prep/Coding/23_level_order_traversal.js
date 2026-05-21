/**
 * Q23 | Level Order Traversal (BFS)
 * Difficulty : Easy
 * Pattern    : Queue BFS
 * Companies  : Amazon, Google, Microsoft
 *
 * PROBLEM:
 *   Return level-by-level values of binary tree as array of arrays.
 *
 * APPROACH:
 *   Use a queue. Process all nodes at current level before moving to next.
 *   Snapshot queue size at start of each level → that many nodes to process.
 *
 * TIME: O(n)  SPACE: O(n)
 */

class TreeNode {
  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }
}

function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue  = [root];

  while (queue.length) {
    const levelSize = queue.length;
    const level = [];

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}

// Build: [3,9,20,null,null,15,7]
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);

// --- Tests ---
console.log(levelOrder(root)); // [[3],[9,20],[15,7]]
console.log(levelOrder(null)); // []
