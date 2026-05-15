import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class FindDuplicates {

    /**
     * Generate a list of random numbers (with possible duplicates).
     *
     * @param size  how many numbers to generate
     * @param start minimum value (inclusive)
     * @param end   maximum value (inclusive)
     * @return list of random integers
     */
    public static List<Integer> generateRandomNumbers(int size, int start, int end) {
        Random random = new Random();
        List<Integer> numbers = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            numbers.add(random.nextInt(end - start + 1) + start);
        }
        return numbers;
    }

    /**
     * Find duplicate numbers in a list.
     *
     * @param numbers input list
     * @return sorted list of duplicates
     */
    public static List<Integer> findDuplicates(List<Integer> numbers) {
        Set<Integer> seen = new HashSet<>();
        Set<Integer> duplicates = new HashSet<>();

        for (int num : numbers) {
            if (!seen.add(num)) {
                duplicates.add(num);
            }
        }

        List<Integer> result = new ArrayList<>(duplicates);
        Collections.sort(result);
        return result;
    }

    public static void main(String[] args) {
        List<Integer> numbers = generateRandomNumbers(20, 1, 15);
        System.out.println("Generated numbers : " + numbers);

        List<Integer> duplicates = findDuplicates(numbers);

        if (!duplicates.isEmpty()) {
            System.out.println("Duplicate numbers : " + duplicates);
        } else {
            System.out.println("No duplicates found.");
        }
    }
}
