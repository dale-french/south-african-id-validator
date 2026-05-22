import type { Gender } from "./types.js";

/**
 * Extract the gender from a South African ID number.
 *
 * The `SSSS` block (digits 7–10) is `< 5000` for female and `>= 5000` for
 * male. The caller is responsible for length and character-class validation.
 */
export function parseGender(idNumber: string): Gender {
  return Number(idNumber.slice(6, 10)) < 5000 ? "female" : "male";
}
