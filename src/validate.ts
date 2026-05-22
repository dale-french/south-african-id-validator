import { isValidLuhn } from "./luhn.js";
import { parseCitizenship } from "./parse-citizenship.js";
import { parseDateOfBirth } from "./parse-date-of-birth.js";
import { parseGender } from "./parse-gender.js";
import type { ValidateOptions, ValidationResult } from "./types.js";

const ID_LENGTH = 13;

/**
 * Validate a South African ID number and, on success, extract the encoded
 * date of birth, gender, and citizenship.
 *
 * The result is a discriminated union — narrow with `result.valid` to access
 * the data fields, or with `!result.valid` to access the typed `error` code.
 *
 * The pipeline short-circuits on the first failure and reports the most
 * fundamental problem first: length, then character class, then Luhn
 * checksum, then date validity, then citizenship digit.
 *
 * @example
 * ```ts
 * const result = validate('7311190013080');
 * if (result.valid) {
 *   console.log(result.dateOfBirth, result.gender, result.citizenship);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 *
 * @param idNumber The 13-digit ID number to validate.
 * @param options Optional overrides — see {@link ValidateOptions}.
 */
export function validate(idNumber: string, options: ValidateOptions = {}): ValidationResult {
  if (typeof idNumber !== "string" || idNumber.length !== ID_LENGTH) {
    return { valid: false, error: "INVALID_LENGTH" };
  }

  if (!/^\d{13}$/.test(idNumber)) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  if (!isValidLuhn(idNumber)) {
    return { valid: false, error: "INVALID_CHECKSUM" };
  }

  const dateOfBirth = parseDateOfBirth(idNumber, options.referenceDate);
  if (dateOfBirth === null) {
    return { valid: false, error: "INVALID_DATE" };
  }

  const citizenship = parseCitizenship(idNumber);
  if (citizenship === null) {
    return { valid: false, error: "INVALID_FORMAT" };
  }

  const gender = parseGender(idNumber);

  return { valid: true, dateOfBirth, gender, citizenship };
}
