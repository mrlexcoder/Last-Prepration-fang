/**
 * Pattern 52: Prime Number Triangle
 *
 * n=5 output:
 * 2
 * 3 5
 * 7 11 13
 * 17 19 23 29
 * 31 37 41 43 47
 *
 * Logic:
 *   Generate primes using Sieve of Eratosthenes
 *   Row i → print i primes (continuing from where we left off)
 */

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function primeTriangle(n) {
  // collect enough primes
  const total = (n * (n + 1)) / 2;
  const primes = [];
  let num = 2;
  while (primes.length < total) {
    if (isPrime(num)) primes.push(num);
    num++;
  }

  let idx = 0;
  for (let i = 1; i <= n; i++) {
    const row = [];
    for (let j = 0; j < i; j++) row.push(primes[idx++]);
    console.log(row.join(" "));
  }
}

primeTriangle(5);
