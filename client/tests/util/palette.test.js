import { describe, test, expect } from "vitest";
import { colorForIndex } from "../../src/util/palette.js";

describe("colorForIndex", () => {
    test("returns a color", () => {
        expect(colorForIndex(0)).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    test("cycles back to the same color after palette is exhausted", () => {
        const first = colorForIndex(0);
        let paletteLength = 1;
        while (colorForIndex(paletteLength) !== first) paletteLength++;
        expect(colorForIndex(paletteLength)).toBe(first);
    });

    test("gives different colors to different courses", () => {
        expect(colorForIndex(0)).not.toBe(colorForIndex(1));
    });
});
