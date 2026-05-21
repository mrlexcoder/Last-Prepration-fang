/**
 * Q13 | Group Anagrams
 * Difficulty : Medium
 * Pattern    : Sort key / HashMap
 * Companies  : Google, Cognizant
 *
 * PROBLEM:
 *   Group strings that are anagrams of each other.
 *
 * APPROACH:
 *   Sort each word alphabetically → anagrams produce same key.
 *   Use HashMap: sorted_word → [original words].
 *
 * TIME: O(n * k log k)  SPACE: O(n * k)
 */

function groupAnagrams(strs) {
  const map = new Map();

  for (const word of strs) {
    const key = word.split("").sort().join("");
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(word);
  }

  return [...map.values()];
}

// --- Tests ---
console.log(groupAnagrams(["eat","tea","tan","ate","nat","bat"]));
// [["eat","tea","ate"],["tan","nat"],["bat"]]
console.log(groupAnagrams([""]));  // [[""]]
console.log(groupAnagrams(["a"])); // [["a"]]
