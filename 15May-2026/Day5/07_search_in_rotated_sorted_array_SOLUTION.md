# Solution: Search in Rotated Sorted Array (LC-33)

> Closes #1

---

## The Core Insight

A rotated sorted array like `[4, 5, 6, 7, 0, 1, 2]` has one key property:

> **When you split it at any `mid`, at least ONE of the two halves is always perfectly sorted.**

That's the trick. Standard binary search works on a sorted array. Here we just need to figure out **which half is sorted**, then check if our target lives there.

---

## Step-by-Step Logic

```
nums = [4, 5, 6, 7, 0, 1, 2],  target = 0
        lo=0           hi=6
```

**Iteration 1:**
```
mid = 3  →  nums[mid] = 7
nums[lo]=4 <= nums[mid]=7  →  LEFT half [4,5,6,7] is sorted
Is target(0) in range [4, 7)?  NO
→ go RIGHT:  lo = mid + 1 = 4
```

**Iteration 2:**
```
lo=4, hi=6,  mid=5  →  nums[mid] = 1
nums[lo]=0 <= nums[mid]=1  →  LEFT half [0,1] is sorted
Is target(0) in range [0, 1)?  YES
→ go LEFT:  hi = mid - 1 = 4
```

**Iteration 3:**
```
lo=4, hi=4,  mid=4  →  nums[mid] = 0  === target
→ return 4 ✓
```

---

## Answering the Issue Questions

### Q1: Why do we track both `lo` and `hi` boundaries?
Because we need to check if the **left half** `[lo..mid]` is sorted by comparing `nums[lo] <= nums[mid]`. Without `lo`, we can't tell which side the rotation is on.

### Q2: How does rotation affect standard binary search?
Normal binary search: if `target < nums[mid]` → go left. Always.
Rotated: that rule breaks because the left side might have SMALLER numbers after the pivot. So we first confirm which half is sorted, THEN apply the range check.

### Q3: Are there cases where this fails?
No edge cases break it, but watch out for:
- **Duplicates** → this solution assumes all values are unique (LC-33 constraint). For duplicates, see LC-81.
- **No rotation** → works fine, behaves like normal binary search.
- **Single element** → `lo == hi == mid`, checked immediately.

---

## Final Clean Solution

```js
function search(nums, target) {
  let lo = 0;
  let hi = nums.length - 1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);

    if (nums[mid] === target) return mid;

    if (nums[lo] <= nums[mid]) {
      // left half [lo..mid] is sorted
      if (nums[lo] <= target && target < nums[mid]) {
        hi = mid - 1; // target in left half
      } else {
        lo = mid + 1; // target in right half
      }
    } else {
      // right half [mid..hi] is sorted
      if (nums[mid] < target && target <= nums[hi]) {
        lo = mid + 1; // target in right half
      } else {
        hi = mid - 1; // target in left half
      }
    }
  }

  return -1;
}
```

---

## Complexity

| | Value |
|---|---|
| Time | O(log n) — binary search |
| Space | O(1) — no extra memory |

---

## All Test Cases Pass

| Input | Target | Output |
|-------|--------|--------|
| `[4,5,6,7,0,1,2]` | `0` | `4` ✓ |
| `[4,5,6,7,0,1,2]` | `3` | `-1` ✓ |
| `[1]` | `0` | `-1` ✓ |
| `[1]` | `1` | `0` ✓ |
| `[3,1]` | `1` | `1` ✓ |
