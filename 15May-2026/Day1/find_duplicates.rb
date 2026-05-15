require 'set'

# Generate an array of random numbers (with possible duplicates).
# @param size  [Integer] how many numbers to generate
# @param start [Integer] minimum value (inclusive)
# @param stop  [Integer] maximum value (inclusive)
# @return [Array<Integer>]
def generate_random_numbers(size: 20, start: 1, stop: 15)
  Array.new(size) { rand(start..stop) }
end

# Find duplicate numbers in an array.
# @param numbers [Array<Integer>]
# @return [Array<Integer>] sorted list of duplicates
def find_duplicates(numbers)
  seen       = Set.new
  duplicates = Set.new

  numbers.each do |num|
    if seen.include?(num)
      duplicates.add(num)
    else
      seen.add(num)
    end
  end

  duplicates.to_a.sort
end

# --- main ---
numbers = generate_random_numbers
puts "Generated numbers : #{numbers}"

duplicates = find_duplicates(numbers)

if duplicates.any?
  puts "Duplicate numbers : #{duplicates}"
else
  puts "No duplicates found."
end
