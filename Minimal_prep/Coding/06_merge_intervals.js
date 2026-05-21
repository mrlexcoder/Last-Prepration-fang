/**
 * Q6 | Merge Intervals
 * Difficulty : Medium
 * Pattern    : Sort + merge
 * Companies  : Amazon, Google, Uber
 *
 * PROBLEM:
 *   Given array of intervals, merge all overlapping ones.
 *   [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]
 *
 * APPROACH:
 *   1. Sort intervals by start time
 *   2. Iterate: if current start <= last merged end → extend end
 *               else → push new interval
 *
 * TIME: O(n log n)  SPACE: O(n)
 */

function merge(intervals) {
  intervals.sort((a, b) => a[0] - b[0]); // sort by start
  const result = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const last    = result[result.length - 1];
    const current = intervals[i];

    if (current[0] <= last[1]) {
      // overlapping → extend end if needed
      last[1] = Math.max(last[1], current[1]);
    } else {
      result.push(current); // no overlap → new interval
    }
  }
  return result;
}

// --- Tests ---
console.log(merge([[1,3],[2,6],[8,10],[15,18]])); // [[1,6],[8,10],[15,18]]
console.log(merge([[1,4],[4,5]]));                // [[1,5]]
console.log(merge([[1,4],[2,3]]));                // [[1,4]]
