/**
 * Q28 | Number of Islands
 * Difficulty : Medium
 * Pattern    : DFS flood fill
 * Companies  : Amazon, Google, Microsoft
 *
 * PROBLEM:
 *   Given 2D grid of '1' (land) and '0' (water), count number of islands.
 *   An island is surrounded by water and formed by connecting adjacent lands.
 *
 * APPROACH:
 *   For each unvisited '1', run DFS to mark entire island as visited ('0').
 *   Count how many times we start a DFS.
 *
 * TIME: O(m*n)  SPACE: O(m*n) recursion stack
 */

function numIslands(grid) {
  if (!grid.length) return 0;
  let count = 0;

  function dfs(r, c) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (grid[r][c] !== "1") return;
    grid[r][c] = "0"; // mark visited
    dfs(r+1, c); dfs(r-1, c);
    dfs(r, c+1); dfs(r, c-1);
  }

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] === "1") {
        count++;
        dfs(r, c); // sink the island
      }
    }
  }
  return count;
}

// --- Tests ---
console.log(numIslands([
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
])); // 1

console.log(numIslands([
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
])); // 3
