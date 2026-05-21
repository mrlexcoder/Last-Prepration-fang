/**
 * Q8 | Trapping Rain Water
 * Difficulty : Hard
 * Pattern    : Two-pointer
 * Companies  : Amazon, Google, Adobe
 *
 * PROBLEM:
 *   Given elevation map, compute how much water it can trap after rain.
 *   height = [0,1,0,2,1,0,1,3,2,1,2,1] → 6
 *
 * APPROACH (Two-pointer):
 *   Water at position i = min(maxLeft, maxRight) - height[i]
 *   Use lo/hi pointers. Process the side with smaller max height.
 *   If maxLeft < maxRight → water at lo is determined by maxLeft → process lo
 *   Else → process hi
 *
 * TIME: O(n)  SPACE: O(1)
 */

function trap(height) {
  let lo = 0, hi = height.length - 1;
  let maxLeft = 0, maxRight = 0;
  let water = 0;

  while (lo < hi) {
    if (height[lo] < height[hi]) {
      if (height[lo] >= maxLeft) {
        maxLeft = height[lo]; // update max
      } else {
        water += maxLeft - height[lo]; // trap water
      }
      lo++;
    } else {
      if (height[hi] >= maxRight) {
        maxRight = height[hi];
      } else {
        water += maxRight - height[hi];
      }
      hi--;
    }
  }
  return water;
}

// --- Tests ---
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // 6
console.log(trap([4, 2, 0, 3, 2, 5]));                    // 9
console.log(trap([3, 0, 2, 0, 4]));                       // 7
