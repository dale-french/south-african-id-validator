import { describe, expect, it } from "vitest";
import { parseGender } from "./parse-gender.js";

describe("parseGender", () => {
  it("returns female for the SSSS=4999 boundary", () => {
    expect(parseGender("000000499900")).toBe("female");
  });

  it("returns male for the SSSS=5000 boundary", () => {
    expect(parseGender("000000500000")).toBe("male");
  });

  it("returns female for all-zero SSSS", () => {
    expect(parseGender("000000000000")).toBe("female");
  });

  it("returns male for all-nine SSSS", () => {
    expect(parseGender("000000999900")).toBe("male");
  });

  it("matches known SA IDs", () => {
    expect(parseGender("7311190013080")).toBe("female");
    expect(parseGender("9202295029188")).toBe("male");
  });
});
