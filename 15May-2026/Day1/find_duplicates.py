import random


def generate_random_numbers(size=20, start=1, end=15):
    """Generate a list of random numbers (with possible duplicates)."""
    return [random.randint(start, end) for _ in range(size)]


def find_duplicates(numbers):
    """Find and return duplicate numbers from a list."""
    seen = set()
    duplicates = set()

    for num in numbers:
        if num in seen:
            duplicates.add(num)
        else:
            seen.add(num)

    return sorted(duplicates)


if __name__ == "__main__":
    numbers = generate_random_numbers()
    print(f"Generated numbers : {numbers}")

    duplicates = find_duplicates(numbers)

    if duplicates:
        print(f"Duplicate numbers : {duplicates}")
    else:
        print("No duplicates found.")
