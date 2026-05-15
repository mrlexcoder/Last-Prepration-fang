<?php

/**
 * Generate an array of random numbers (with possible duplicates).
 *
 * @param int $size  how many numbers to generate
 * @param int $start minimum value (inclusive)
 * @param int $end   maximum value (inclusive)
 * @return int[]
 */
function generateRandomNumbers(int $size = 20, int $start = 1, int $end = 15): array {
    $numbers = [];
    for ($i = 0; $i < $size; $i++) {
        $numbers[] = rand($start, $end);
    }
    return $numbers;
}

/**
 * Find duplicate numbers in an array.
 *
 * @param int[] $numbers
 * @return int[] sorted list of duplicates
 */
function findDuplicates(array $numbers): array {
    $seen       = [];
    $duplicates = [];

    foreach ($numbers as $num) {
        if (isset($seen[$num])) {
            $duplicates[$num] = true;
        } else {
            $seen[$num] = true;
        }
    }

    $result = array_keys($duplicates);
    sort($result);
    return $result;
}

// --- main ---
$numbers = generateRandomNumbers();
echo "Generated numbers : [" . implode(", ", $numbers) . "]\n";

$duplicates = findDuplicates($numbers);

if (!empty($duplicates)) {
    echo "Duplicate numbers : [" . implode(", ", $duplicates) . "]\n";
} else {
    echo "No duplicates found.\n";
}
