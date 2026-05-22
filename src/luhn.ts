/**
 * Verify that the final digit of a numeric string is the correct Luhn check
 * digit over the preceding digits.
 *
 * Knows nothing about South African ID numbers — it is the bare algorithm.
 *
 * @param digits A string of ASCII digits. Anything else (empty string,
 * non-digit characters) returns `false`.
 * @returns `true` when the Luhn checksum is valid, `false` otherwise.
 */
export function isValidLuhn(digits: string): boolean {
  if (digits.length < 2) return false;
  if (!/^\d+$/.test(digits)) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let value = digits.charCodeAt(i) - 48;
    if (shouldDouble) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
