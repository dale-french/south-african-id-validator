import { describe, expect, it } from "vitest";
import { validate } from "./validate.js";

const REFERENCE = new Date("2026-05-21T12:00:00");

describe("validate", () => {
  describe("valid IDs", () => {
    it("parses a female citizen", () => {
      const result = validate("7311190013080", { referenceDate: REFERENCE });
      expect(result).toEqual({
        valid: true,
        dateOfBirth: new Date(1973, 10, 19),
        gender: "female",
        citizenship: "citizen",
      });
    });

    it("parses a male permanent resident", () => {
      const result = validate("9202295029188", { referenceDate: REFERENCE });
      expect(result).toEqual({
        valid: true,
        dateOfBirth: new Date(1992, 1, 29),
        gender: "male",
        citizenship: "permanent_resident",
      });
    });

    it("parses a male citizen", () => {
      const result = validate("9202295029089", { referenceDate: REFERENCE });
      expect(result).toEqual({
        valid: true,
        dateOfBirth: new Date(1992, 1, 29),
        gender: "male",
        citizenship: "citizen",
      });
    });

    it("parses a female permanent resident", () => {
      const result = validate("7311190013189", { referenceDate: REFERENCE });
      expect(result).toEqual({
        valid: true,
        dateOfBirth: new Date(1973, 10, 19),
        gender: "female",
        citizenship: "permanent_resident",
      });
    });
  });

  describe("error codes", () => {
    it("returns INVALID_LENGTH for too-short input", () => {
      expect(validate("123")).toEqual({ valid: false, error: "INVALID_LENGTH" });
    });

    it("returns INVALID_LENGTH for too-long input", () => {
      expect(validate("73111900130800000")).toEqual({
        valid: false,
        error: "INVALID_LENGTH",
      });
    });

    it("returns INVALID_LENGTH for the empty string", () => {
      expect(validate("")).toEqual({ valid: false, error: "INVALID_LENGTH" });
    });

    it("returns INVALID_LENGTH for non-string input", () => {
      // Defensive — runtime input can violate the type contract.
      expect(validate(null as unknown as string)).toEqual({
        valid: false,
        error: "INVALID_LENGTH",
      });
    });

    it("returns INVALID_FORMAT for non-digit characters", () => {
      expect(validate("7311190013O80")).toEqual({
        valid: false,
        error: "INVALID_FORMAT",
      });
    });

    it("returns INVALID_FORMAT when the citizenship digit is neither 0 nor 1", () => {
      // Luhn-valid but C=2.
      expect(validate("7311190013288", { referenceDate: REFERENCE })).toEqual({
        valid: false,
        error: "INVALID_FORMAT",
      });
    });

    it("returns INVALID_CHECKSUM when the Luhn check digit is wrong", () => {
      // Flip the final digit of a known-valid ID.
      expect(validate("7311190013081")).toEqual({
        valid: false,
        error: "INVALID_CHECKSUM",
      });
    });

    it("returns INVALID_DATE for an impossible calendar date", () => {
      // 230230 is Luhn-valid here but Feb 30 doesn't exist.
      expect(validate("2302300013081", { referenceDate: REFERENCE })).toEqual({
        valid: false,
        error: "INVALID_DATE",
      });
    });
  });

  describe("error precedence", () => {
    it("reports length before format", () => {
      expect(validate("XYZ")).toEqual({ valid: false, error: "INVALID_LENGTH" });
    });

    it("reports format before checksum", () => {
      expect(validate("XXXXXXXXXXXXX")).toEqual({
        valid: false,
        error: "INVALID_FORMAT",
      });
    });

    it("reports checksum before date", () => {
      // Feb 30 + wrong check digit → checksum is reported first.
      expect(validate("2302300013080")).toEqual({
        valid: false,
        error: "INVALID_CHECKSUM",
      });
    });
  });
});
