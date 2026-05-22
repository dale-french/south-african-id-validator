import { describe, expect, it } from "vitest";
import { parseDateOfBirth } from "./parse-date-of-birth.js";

const ref = (iso: string) => new Date(`${iso}T12:00:00`);

describe("parseDateOfBirth", () => {
  describe("century inference (16-year eligibility rule)", () => {
    const REF = ref("2026-05-21");

    it("treats a candidate born on the cutoff date as eligible (current century)", () => {
      // YY=10, born 2010-05-21, reference 2026-05-21 → exactly 16 → current century.
      const dob = parseDateOfBirth("1005210001085", REF);
      expect(dob).toEqual(new Date(2010, 4, 21));
    });

    it("moves a candidate born one day after the cutoff to the previous century", () => {
      // Born 2010-05-22 with ref 2026-05-21 → not yet 16 → previous century.
      const dob = parseDateOfBirth("1005220001083", REF);
      expect(dob).toEqual(new Date(1910, 4, 22));
    });

    it("keeps a candidate born one day before the cutoff in the current century", () => {
      // YY=10, MM=05, DD=20, ref 2026-05-21 → 16y 1d → eligible → current century.
      const dob = parseDateOfBirth("1005200000000", REF);
      expect(dob).toEqual(new Date(2010, 4, 20));
    });

    it("infers the previous century for years that would otherwise be in the future", () => {
      // YY=30, ref 2026 → no such 2030 person exists yet → 1930.
      const dob = parseDateOfBirth("3001010000000", REF);
      expect(dob?.getFullYear()).toBe(1930);
    });

    it("defaults to the system clock when no referenceDate is supplied", () => {
      const result = parseDateOfBirth("7311190013080");
      expect(result).toEqual(new Date(1973, 10, 19));
    });
  });

  describe("leap-year handling", () => {
    const REF = ref("2026-05-21");

    it("accepts Feb 29 of a leap year", () => {
      // 920229 → 1992 (a leap year)
      const dob = parseDateOfBirth("9202295029188", REF);
      expect(dob).toEqual(new Date(1992, 1, 29));
    });

    it("rejects Feb 29 of a non-leap year", () => {
      // 990229 → 1999 (not a leap year)
      expect(parseDateOfBirth("9902290001088", REF)).toBeNull();
    });

    it("accepts Feb 29 in a year divisible by 400", () => {
      // 000229 → 2000 (leap, divisible by 400). With ref 2026, candidate 2000-02-29 < cutoff → stays 2000.
      const dob = parseDateOfBirth("0002290000000", REF);
      expect(dob).toEqual(new Date(2000, 1, 29));
    });
  });

  describe("impossible calendar dates", () => {
    const REF = ref("2026-05-21");

    it("rejects Feb 30", () => {
      expect(parseDateOfBirth("2302300013081", REF)).toBeNull();
    });

    it("rejects Sep 31", () => {
      expect(parseDateOfBirth("2309310000000", REF)).toBeNull();
    });

    it("rejects month 00 and month 13", () => {
      expect(parseDateOfBirth("2300150000000", REF)).toBeNull();
      expect(parseDateOfBirth("2313150000000", REF)).toBeNull();
    });

    it("rejects day 00", () => {
      expect(parseDateOfBirth("2305000000000", REF)).toBeNull();
    });
  });
});
