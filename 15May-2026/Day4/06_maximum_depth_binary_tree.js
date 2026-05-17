/**
 * LC-104 | Maximum Depth of Binary Tree
 * Difficulty : Easy
 * Pattern    : Tree DFS (Recursion)
 * Companies  : Amazon, Google, Microsoft, Meta, TCS
 * Must-Do    : Yes
 *
 * PROBLEM:
 *   Given the root of a binary tree, return its maximum depth.
 *   Maximum depth = number of nodes along the longest path
 *   from root down to the farthest leaf node.
 *
 * APPROACH — Recursive DFS:
 *   maxDepth(node) = 1 + max(maxDepth(left), maxDepth(right))
 *   Base case: null node → depth 0
 *   O(n) time (visit every node), O(h) space (call stack = tree height)
 *
 * EXAMPLE:
 *        3
 *       / \
 *      9  20
 *         / \
 *        15   7
 *
 *   maxDepth(3)
 *     = 1 + max(maxDepth(9), maxDepth(20))
 *     = 1 + max(1, 1 + max(maxDepth(15), maxDepth(7)))
 *     = 1 + max(1, 1 + max(1, 1))
 *     = 1 + max(1, 2)
 *     = 1 + 2 = 3 ✓
 */

class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

function maxDepth(root) {
  if (root === null) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// --- Helper: build tree from level-order array (null = missing node) ---
function buildTree(arr) {
  if (!arr.length || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (queue.length && i < arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) { node.left  = new TreeNode(arr[i]); queue.push(node.left);  } i++;
    if (i < arr.length && arr[i] !== null) { node.right = new TreeNode(arr[i]); queue.push(node.right); } i++;
  }
  return root;
}

// --- Tests ---
console.log(maxDepth(buildTree([3, 9, 20, null, null, 15, 7]))); // 3
console.log(maxDepth(buildTree([1, null, 2])));                   // 2
console.log(maxDepth(buildTree([])));                             // 0
console.log(maxDepth(buildTree([1])));                            // 1
console.log(maxDepth(buildTree([1, 2, 3, 4, 5])));               // 3
