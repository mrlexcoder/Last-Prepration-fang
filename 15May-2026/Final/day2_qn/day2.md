# Day 2 Questions

## Topic: Arrays & Strings

### Q1 — Two Sum (LC-1) | Easy
- **Pattern:** HashMap complement lookup
- **Companies:** Google, Amazon, Microsoft, Meta
- **Hint:** Store `target - num` in a map, check on each iteration

### Q2 — Best Time to Buy & Sell Stock (LC-121) | Easy
- **Pattern:** Greedy — track min price
- **Companies:** Amazon, Meta, Google
- **Hint:** `max_profit = max(max_profit, price - min_price)`

### Q3 — Contains Duplicate (LC-217) | Easy
- **Pattern:** HashSet
- **Companies:** Amazon, Google, Apple
- **Hint:** Add to set, return true if already present

### Q4 — Product of Array Except Self (LC-238) | Medium
- **Pattern:** Prefix Products (no division)
- **Companies:** Amazon, Meta, Google, Microsoft
- **Hint:** Left pass then right pass, O(n) time O(1) extra space

### Q5 — Maximum Subarray / Kadane's (LC-53) | Medium
- **Pattern:** Kadane's Algorithm
- **Companies:** Amazon, Google, Microsoft
- **Hint:** `curr = max(nums[i], curr + nums[i])`

---

## Notes
- Always clarify constraints (negative numbers? duplicates? sorted?)
- Think brute force → optimize
- State time & space complexity before coding
