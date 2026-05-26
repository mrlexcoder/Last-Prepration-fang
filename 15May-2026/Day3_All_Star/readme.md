# Day 3 — Star Patterns

Practice printing star patterns using nested loops. A classic topic in coding interviews and college exams.

## 📅 Latest Update
- **Date:** May 26, 2026
- **Status:** Complete with 7 pattern implementations

---

## Patterns Covered

| File | Pattern | Preview |
|------|---------|---------|
| `01_right_triangle.js` | Right Triangle | Stars grow left to right |
| `02_inverted_right_triangle.js` | Inverted Right Triangle | Stars shrink left to right |
| `03_pyramid.js` | Pyramid | Centered, grows downward |
| `04_inverted_pyramid.js` | Inverted Pyramid | Centered, shrinks downward |
| `05_diamond.js` | Diamond | Pyramid + Inverted Pyramid |
| `06_hollow_rectangle.js` | Hollow Rectangle | Border only |
| `07_butterfly.js` | Butterfly | Mirror wings |

---

## How to Run

```bash
node 01_right_triangle.js
node 02_inverted_right_triangle.js
node 03_pyramid.js
node 04_inverted_pyramid.js
node 05_diamond.js
node 06_hollow_rectangle.js
node 07_butterfly.js
```

---

## Key Concepts

| Concept | Used In |
|---------|---------|
| `"*".repeat(n)` | All patterns |
| `" ".repeat(n)` | Pyramid, Diamond, Butterfly |
| Nested loops | All patterns |
| Top + Bottom halves | Diamond, Butterfly |
| Border condition `i===1 \|\| i===rows` | Hollow Rectangle |

---

## Pattern Outputs (n=5)

### Right Triangle
```
*
**
***
****
*****
```

### Pyramid
```
    *
   ***
  *****
 *******
*********
```

### Diamond
```
    *
   ***
  *****
 *******
*********
 *******
  *****
   ***
    *
```

### Butterfly (n=4)
```
*      *
**    **
***  ***
********
********
***  ***
**    **
*      *
```

---

## Practice Tips

1. Start with the right triangle - it's the simplest
2. Understand how spaces and stars work together
3. Practice drawing the pattern on paper first
4. Break complex patterns into halves (top/bottom)

---

*Last updated: May 26, 2026*