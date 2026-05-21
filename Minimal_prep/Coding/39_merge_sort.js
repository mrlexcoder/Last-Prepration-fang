/**
 * Q39 | Merge Sort Implementation
 * Difficulty : Medium
 * Pattern    : Divide & Conquer
 * Companies  : TCS, Infosys, Wipro
 *
 * PROBLEM:
 *   Sort array using merge sort.
 *
 * APPROACH:
 *   1. Divide array in half recursively until single elements.
 *   2. Merge two sorted halves by comparing element by element.
 *   3. Combine results.
 *
 *   Key insight: merging two sorted arrays is O(n).
 *   Total: O(n log n) — log n levels, each level O(n) work.
 *
 * TIME: O(n log n)  SPACE: O(n)
 */

function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid   = Math.floor(arr.length / 2);
  const left  = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return mergeSorted(left, right);
}

function mergeSorted(left, right) {
  const result = [];
  let i = 0, j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else                     result.push(right[j++]);
  }

  // append remaining elements
  while (i < left.length)  result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);

  return result;
}

// --- Tests ---
console.log(mergeSort([38,27,43,3,9,82,10])); // [3,9,10,27,38,43,82]
console.log(mergeSort([5,4,3,2,1]));           // [1,2,3,4,5]
console.log(mergeSort([1]));                   // [1]
console.log(mergeSort([]));                    // []
