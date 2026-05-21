/**
 * Q26 | Binary Tree Zigzag Level Order Traversal
 * Difficulty : Medium
 * Pattern    : BFS + direction flag
 * Companies  : Amazon, Microsoft
 *
 * PROBLEM:
 *   Level order but alternate direction each level.
 *   Level 1: left→right, Level 2: right→left, etc.
 *
 * APPROACH:
 *   BFS with queue. Use leftToRight flag.
 *   If leftToRight → push to end of level array.
 *   If rightToLeft → unshift (prepend) to level array.
 *   Toggle flag each level.
 *
 * TIME: O(n)  SPACE: O(n)
 */

class TreeNode {
  constructor(val, left=null, right=null) { this.val=val; this.left=left; this.right=right; }
}

function zigzagLevelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue  = [root];
  let leftToRight = true;

  while (queue.length) {
    const size  = queue.length;
    const level = [];

    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (leftToRight) level.push(node.val);
      else             level.unshift(node.val); // prepend for reverse
      if (node.left)  queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(level);
    leftToRight = !leftToRight;
  }
  return result;
}

// --- Tests ---
const root = new TreeNode(3,
  new TreeNode(9),
  new TreeNode(20, new TreeNode(15), new TreeNode(7))
);
console.log(zigzagLevelOrder(root)); // [[3],[20,9],[15,7]]
