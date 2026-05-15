/**
 * Generate an array of random numbers (with possible duplicates).
 * @param {number} size  - how many numbers to generate
 * @param {number} start - minimum value (inclusive)
 * @param {number} end   - maximum value (inclusive)
 * @returns {number[]}
 */
function generateRandomNumbers(size = 20, start = 1, end = 15) {
  return Array.from({ length: size }, () =>
    Math.floor(Math.random() * (end - start + 1)) + start
  );
}

/**
 * Find duplicate numbers in an array.
 * @param {number[]} numbers
 * @returns {number[]} sorted list of duplicates
 */
function findDuplicates(numbers) {
  const seen = new Set();
  const duplicates = new Set();

  for (const num of numbers) {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  }

  return [...duplicates].sort((a, b) => a - b);
}

// --- main ---
const numbers = generateRandomNumbers();
console.log("Generated numbers :", numbers);

const duplicates = findDuplicates(numbers);

if (duplicates.length > 0) {
  console.log("Duplicate numbers :", duplicates);
} else {
  console.log("No duplicates found.");
}
