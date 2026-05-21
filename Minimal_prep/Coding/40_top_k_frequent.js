/**
 * Q40 | Top K Frequent Elements
 * Difficulty : Medium
 * Pattern    : Bucket sort by frequency (O(n)) or Min-heap size K
 * Companies  : Amazon, Google
 *
 * PROBLEM:
 *   Return k most frequent elements. Order doesn't matter.
 *   [1,1,1,2,2,3], k=2 → [1,2]
 *
 * APPROACH (Bucket Sort — O(n)):
 *   1. Count frequencies with HashMap.
 *   2. Create buckets where index = frequency (max freq = n).
 *   3. Iterate buckets from high to low, collect k elements.
 *
 * TIME: O(n)  SPACE: O(n)
 */

function topKFrequent(nums, k) {
  // Step 1: count frequencies
  const freq = new Map();
  for (const n of nums) freq.set(n, (freq.get(n) || 0) + 1);

  // Step 2: bucket by frequency (index = frequency)
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [num, count] of freq) {
    buckets[count].push(num);
  }

  // Step 3: collect top k from highest frequency bucket down
  const result = [];
  for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
    result.push(...buckets[i]);
  }
  return result.slice(0, k);
}

// --- Tests ---
console.log(topKFrequent([1,1,1,2,2,3], 2)); // [1,2]
console.log(topKFrequent([1], 1));            // [1]
console.log(topKFrequent([4,1,1,2,2,3], 2)); // [1,2] or [2,1]
