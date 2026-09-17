import { describe, expect, it } from "vitest";
import { normalizeAspectRatio, toCssAspectRatio } from "./aspectRatio";

describe("aspect ratio helpers", () => {
  it("preserves supported numeric ratios", () => {
    expect(normalizeAspectRatio("16:9")).toBe("16:9");
    expect(toCssAspectRatio("9:16")).toBe("9 / 16");
  });

  it("falls back safely for missing or invalid values", () => {
    expect(normalizeAspectRatio()).toBe("1:1");
    expect(toCssAspectRatio("wide")).toBe("1 / 1");
    expect(toCssAspectRatio("0:9")).toBe("1 / 1");
  });
});
