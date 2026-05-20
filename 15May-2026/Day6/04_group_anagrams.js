/**
 * LC-49 | Group Anagrams
 * Difficulty : Medium
 * Pattern    : HashMap + Sorting
 * Companies  : Amazon, Google, Meta, Microsoft
 * Must-Do    : Yes (FAANG favourite)
 *
 * PROBLEM:
 *   Given an array of strings, group the anagrams together.
 *   Return the groups in any order.
 *
 * APPROACH:
 *   - Sort each word alphabetically → anagrams produce the same key
 *   - Use a HashMap: sorted_word → [list of original words]
 *   - Return all values of the map
 *   - O(n * k log k) time where n = words, k = max word length
 *
 * EXAMPLE:
 *   strs = ["eat","tea","tan","ate","nat","bat"]
 *
 *   "eat" → sorted "aet" → map{"aet": ["eat"]}
 *   "tea" → sorted "aet" → map{"aet": ["eat","tea"]}
 *   "tan" → sorted "ant" → map{"aet":[...], "ant":["tan"]}
 *   "ate" → sorted "aet" → map{"aet": ["eat","tea","ate"]}
 *   "nat" → sorted "ant" → map{"ant": ["tan","nat"]}
 *   "bat" → sorted "abt" → map{"abt": ["bat"]}
 *
 *   Result: [["eat","tea","ate"],["tan","nat"],["bat"]] ✓
 */

function groupAnagrams(strs) {
  const map = new Map();

  for (const word of strs) {
    const key = word.split("").sort().join(""); // sorted word as key

    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(word);
  }

  return [...map.values()];
}

// --- Tests ---
console.log(groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"]));
// [["eat","tea","ate"],["tan","nat"],["bat"]]

console.log(groupAnagrams([""]));
// [[""]]

console.log(groupAnagrams(["a"]));
// [["a"]]

console.log(groupAnagrams(["abc", "bca", "cab", "xyz", "zyx"]));
// [["abc","bca","cab"],["xyz","zyx"]]
