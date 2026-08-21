import { describe, test, expect } from "vitest";
import { t, fmtTime } from "../../src/util/time.js";

describe("t (time string -> minutes)", () => {
    test("converts morning time", () => {
        expect(t("09:30")).toBe(570);
    });

    test("converts midnight to 0", () => {
        expect(t("00:00")).toBe(0);
    });

    test("converts afternoon time (no am/pm)", () => {
        expect(t("14:00")).toBe(840);
    });

    test("converts last minute of the day", () => {
        expect(t("23:59")).toBe(1439);
    });
});

describe("fmtTime (minutes -> display string)", () => {
    test("formats morning time", () => {
        expect(fmtTime(570)).toBe("9:30am");
    });

    test("formats on-the-hour time without :00", () => {
        expect(fmtTime(540)).toBe("9am");
    });

    test("formats noon as 12pm", () => {
        expect(fmtTime(720)).toBe("12pm");
    });

    test("formats midnight as 12am", () => {
        expect(fmtTime(0)).toBe("12am");
    });

    test("formats afternoon time", () => {
        expect(fmtTime(870)).toBe("2:30pm");
    });
});

describe("t and fmtTime as round-trip inverses (for on-the-hour times)", () => {
    test("converting to minutes and back gives an equivalent time", () => {
        expect(fmtTime(t("11:00"))).toBe("11am");
        expect(fmtTime(t("15:00"))).toBe("3pm");
    });
});
