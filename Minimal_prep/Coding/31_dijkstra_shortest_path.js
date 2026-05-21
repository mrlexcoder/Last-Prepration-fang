/**
 * Q31 | Shortest Path — Dijkstra's Algorithm
 * Difficulty : Medium
 * Pattern    : Min-heap (Priority Queue)
 * Companies  : Google, Amazon, Uber
 *
 * PROBLEM:
 *   Find shortest path from source to all nodes in weighted graph.
 *
 * APPROACH:
 *   Use min-heap (simulated with sorted array here).
 *   Start with dist[src]=0, all others=Infinity.
 *   Greedily pick unvisited node with smallest distance.
 *   Relax all its neighbors.
 *
 * TIME: O((V+E) log V)  SPACE: O(V)
 */

function dijkstra(graph, src) {
  // graph: { node: [[neighbor, weight], ...] }
  const nodes = Object.keys(graph);
  const dist  = {};
  nodes.forEach(n => dist[n] = Infinity);
  dist[src] = 0;

  // min-heap simulation: [distance, node]
  const heap = [[0, src]];

  while (heap.length) {
    heap.sort((a, b) => a[0] - b[0]); // sort by distance (use real heap in prod)
    const [d, u] = heap.shift();

    if (d > dist[u]) continue; // stale entry

    for (const [v, w] of (graph[u] || [])) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        heap.push([dist[v], v]);
      }
    }
  }
  return dist;
}

// --- Tests ---
const graph = {
  A: [["B", 1], ["C", 4]],
  B: [["C", 2], ["D", 5]],
  C: [["D", 1]],
  D: []
};
console.log(dijkstra(graph, "A")); // {A:0, B:1, C:3, D:4}
