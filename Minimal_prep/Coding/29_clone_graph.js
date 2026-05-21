/**
 * Q29 | Clone Graph
 * Difficulty : Medium
 * Pattern    : BFS + HashMap
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Deep clone an undirected graph. Each node has val and neighbors list.
 *
 * APPROACH:
 *   Use HashMap: original node → cloned node.
 *   BFS from start node. For each node, clone it and clone its neighbors.
 *   If neighbor already cloned (in map), reuse it.
 *
 * TIME: O(V+E)  SPACE: O(V)
 */

class GraphNode {
  constructor(val, neighbors=[]) { this.val=val; this.neighbors=neighbors; }
}

function cloneGraph(node) {
  if (!node) return null;

  const map   = new Map(); // original → clone
  const queue = [node];
  map.set(node, new GraphNode(node.val));

  while (queue.length) {
    const curr  = queue.shift();
    const clone = map.get(curr);

    for (const neighbor of curr.neighbors) {
      if (!map.has(neighbor)) {
        map.set(neighbor, new GraphNode(neighbor.val));
        queue.push(neighbor);
      }
      clone.neighbors.push(map.get(neighbor));
    }
  }
  return map.get(node);
}

// --- Tests ---
const n1=new GraphNode(1), n2=new GraphNode(2);
const n3=new GraphNode(3), n4=new GraphNode(4);
n1.neighbors=[n2,n4]; n2.neighbors=[n1,n3];
n3.neighbors=[n2,n4]; n4.neighbors=[n1,n3];
const cloned = cloneGraph(n1);
console.log(cloned.val);                    // 1
console.log(cloned.neighbors.map(n=>n.val)); // [2,4]
console.log(cloned !== n1);                 // true (deep copy)
