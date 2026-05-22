const ELIGIBILITY_AGE_YEARS = 16;

/**
 * Extract and validate the date of birth from a South African ID number.
 *
 * The first six digits encode `YYMMDD`. The century is inferred using the
 * 16-year eligibility rule: a year that would make the holder younger than 16
 * on `referenceDate` is treated as belonging to the previous century.
 *
 * @param idNumber A 13-digit ID number. The caller is responsible for length
 * and character-class validation.
 * @param referenceDate The date used as "today" for the eligibility rule.
 * Inject a fixed value for deterministic tests; defaults to `new Date()`.
 * @returns The parsed `Date`, or `null` if the encoded date is not a real
 * calendar date (e.g. Feb 30, Feb 29 of a non-leap year).
 */
export function parseDateOfBirth(idNumber: string, referenceDate: Date = new Date()): Date | null {
  const yy = Number(idNumber.slice(0, 2));
  const mm = Number(idNumber.slice(2, 4));
  const dd = Number(idNumber.slice(4, 6));

  const refYear = referenceDate.getFullYear();
  const currentCentury = Math.floor(refYear / 100) * 100;
  let year = currentCentury + yy;

  const candidate = new Date(year, mm - 1, dd);
  const eligibilityCutoff = new Date(
    refYear - ELIGIBILITY_AGE_YEARS,
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  if (candidate > eligibilityCutoff) {
    year -= 100;
  }

  const dateOfBirth = new Date(year, mm - 1, dd);

  if (
    dateOfBirth.getFullYear() !== year ||
    dateOfBirth.getMonth() !== mm - 1 ||
    dateOfBirth.getDate() !== dd
  ) {
    return null;
  }

  return dateOfBirth;
}
