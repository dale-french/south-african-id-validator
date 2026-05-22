/**
 * The gender encoded in a South African ID number.
 */
export type Gender = "male" | "female";

/**
 * The citizenship status encoded in a South African ID number.
 */
export type Citizenship = "citizen" | "permanent_resident";

/**
 * The reason a South African ID number failed validation.
 *
 * - `INVALID_LENGTH` — the input is not exactly 13 characters.
 * - `INVALID_FORMAT` — the input contains non-digit characters, or the
 *   citizenship digit is neither `0` nor `1`.
 * - `INVALID_CHECKSUM` — the digits form a 13-character numeric string but the
 *   final digit does not match the Luhn checksum of the preceding 12.
 * - `INVALID_DATE` — the first six digits do not form a real calendar date
 *   (e.g. Feb 30, Feb 29 of a non-leap year).
 */
export type ValidationErrorCode =
  | "INVALID_LENGTH"
  | "INVALID_FORMAT"
  | "INVALID_CHECKSUM"
  | "INVALID_DATE";

/**
 * The result of validating a South African ID number.
 *
 * Discriminated on `valid`: narrow with `if (result.valid)` to access
 * `dateOfBirth`, `gender`, and `citizenship`; narrow with `if (!result.valid)`
 * to access `error`.
 */
export type ValidationResult =
  | {
      valid: true;
      dateOfBirth: Date;
      gender: Gender;
      citizenship: Citizenship;
    }
  | {
      valid: false;
      error: ValidationErrorCode;
    };

/**
 * Optional configuration for {@link validate}.
 */
export type ValidateOptions = {
  /**
   * The date used as "today" when inferring the century of the encoded year.
   * Inject a fixed value for deterministic tests. Defaults to `new Date()`.
   */
  referenceDate?: Date;
};
