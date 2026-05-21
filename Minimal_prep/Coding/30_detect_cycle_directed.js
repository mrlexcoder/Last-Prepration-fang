/**
 * Q30 | Detect Cycle in Directed Graph
 * Difficulty : Medium
 * Pattern    : DFS + visited states (3-color)
 * Companies  : Amazon, Microsoft
 *
 * PROBLEM:
 *   Given directed graph (adjacency list), return true if it has a cycle.
 *
 * APPROACH (3-color DFS):
 *   WHITE (0) = unvisited
 *   GRAY  (1) = currently in DFS stack (being processed)
 *   BLACK (2) = fully processed
 *
 *   If we reach a GRAY node → back edge → cycle!
 *
 * TIME: O(V+E)  SPACE: O(V)
 */

function hasCycle(numNodes, edges) {
  // build adjacency list
  const graph = Array.from({ length: numNodes }, () => []);
  for (const [u, v] of edges) graph[u].push(v);

  const color = new Array(numNodes).fill(0); // 0=white

  function dfs(node) {
    color[node] = 1; // gray — in stack

    for (const neighbor of graph[node]) {
      if (color[neighbor] === 1) return true;  // back edge → cycle
      if (color[neighbor] === 0 && dfs(neighbor)) return true;
    }

    color[node] = 2; // black — done
    return false;
  }

  for (let i = 0; i < numNodes; i++) {
    if (color[i] === 0 && dfs(i)) return true;
  }
  return false;
}

// --- Tests ---
console.log(hasCycle(4, [[0,1],[1,2],[2,3],[3,1]])); // true  (1→2→3→1)
console.log(hasCycle(4, [[0,1],[1,2],[2,3]]));        // false
console.log(hasCycle(3, [[0,1],[1,2],[2,0]]));        // true
