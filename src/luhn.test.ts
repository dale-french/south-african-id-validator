import { describe, expect, it } from "vitest";
import { isValidLuhn } from "./luhn.js";

describe("isValidLuhn", () => {
  it("accepts known-valid SA ID numbers", () => {
    expect(isValidLuhn("7311190013080")).toBe(true);
    expect(isValidLuhn("9202295029188")).toBe(true);
    expect(isValidLuhn("9202295029089")).toBe(true);
    expect(isValidLuhn("7311190013189")).toBe(true);
  });

  it("rejects an ID with a single off-by-one digit at every position", () => {
    const valid = "7311190013080";
    for (let i = 0; i < valid.length; i++) {
      const flipped = String((Number(valid[i]) + 1) % 10);
      const mutated = valid.slice(0, i) + flipped + valid.slice(i + 1);
      expect(isValidLuhn(mutated)).toBe(false);
    }
  });

  it("rejects a coincidental digit-sum multiple of 10 that fails Luhn", () => {
    // Plain decimal-sum check would accept this; Luhn does not.
    expect(isValidLuhn("1111111111111")).toBe(false);
  });

  it("rejects strings of the wrong length", () => {
    expect(isValidLuhn("")).toBe(false);
    expect(isValidLuhn("0")).toBe(false);
  });

  it("rejects strings that contain non-digit characters", () => {
    expect(isValidLuhn("7311190013O80")).toBe(false);
    expect(isValidLuhn("7311190013 80")).toBe(false);
    expect(isValidLuhn("-311190013080")).toBe(false);
  });

  it("validates a classic non-ID Luhn test vector", () => {
    // The credit-card example from the original Luhn patent.
    expect(isValidLuhn("79927398713")).toBe(true);
    expect(isValidLuhn("79927398710")).toBe(false);
    expect(isValidLuhn("79927398711")).toBe(false);
    expect(isValidLuhn("79927398712")).toBe(false);
  });
});
