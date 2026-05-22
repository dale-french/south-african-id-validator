import { describe, expect, it } from "vitest";
import { parseCitizenship } from "./parse-citizenship.js";

describe("parseCitizenship", () => {
  it('returns "citizen" when the C digit is 0', () => {
    expect(parseCitizenship("7311190013080")).toBe("citizen");
  });

  it('returns "permanent_resident" when the C digit is 1', () => {
    expect(parseCitizenship("9202295029188")).toBe("permanent_resident");
  });

  it("returns null for any other C digit", () => {
    expect(parseCitizenship("0000000000200")).toBeNull();
    expect(parseCitizenship("0000000000900")).toBeNull();
  });
});
