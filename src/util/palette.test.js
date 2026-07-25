import { describe, it, expect } from "vitest";
import { colorForIndex } from "./palette.js";

describe("colorForIndex", () => {
    it("returns a color for index 0", () => {
        expect(colorForIndex(0)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("cycles back to the same color once the palette is exhausted", () => {
        const first = colorForIndex(0);
        let paletteLength = 1;
        while (colorForIndex(paletteLength) !== first) paletteLength++;
        expect(colorForIndex(paletteLength)).toBe(first);
        expect(colorForIndex(paletteLength * 2)).toBe(first);
    });

    it("gives different colors to at least the first two courses", () => {
        expect(colorForIndex(0)).not.toBe(colorForIndex(1));
    });
});
