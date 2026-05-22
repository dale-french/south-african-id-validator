import type { Citizenship } from "./types.js";

/**
 * Extract the citizenship status from a South African ID number.
 *
 * The `C` digit (index 11) is `0` for a citizen and `1` for a permanent
 * resident. Any other value indicates a structurally invalid ID and yields
 * `null`, which `validate()` maps to `INVALID_FORMAT`.
 */
export function parseCitizenship(idNumber: string): Citizenship | null {
  const code = idNumber.charAt(10);
  if (code === "0") return "citizen";
  if (code === "1") return "permanent_resident";
  return null;
}
