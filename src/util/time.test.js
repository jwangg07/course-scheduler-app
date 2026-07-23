import { describe, it, expect } from "vitest";
import { t, fmtTime } from "./time.js";

describe("t (time string -> minutes)", () => {
  it("converts a simple morning time", () => {
    expect(t("09:30")).toBe(570);
  });

  it("converts midnight to 0", () => {
    expect(t("00:00")).toBe(0);
  });

  it("converts an afternoon time correctly (no am/pm ambiguity — this is 24h input)", () => {
    expect(t("14:00")).toBe(840);
  });

  it("converts the last minute of the day", () => {
    expect(t("23:59")).toBe(1439);
  });
});

describe("fmtTime (minutes -> display string)", () => {
  it("formats a morning time with minutes", () => {
    expect(fmtTime(570)).toBe("9:30am");
  });

  it("formats an on-the-hour time without :00 clutter", () => {
    expect(fmtTime(540)).toBe("9am");
  });

  it("formats noon as 12pm, not 0pm", () => {
    expect(fmtTime(720)).toBe("12pm");
  });

  it("formats midnight as 12am, not 0am", () => {
    expect(fmtTime(0)).toBe("12am");
  });

  it("formats an afternoon time", () => {
    expect(fmtTime(870)).toBe("2:30pm");
  });
});

describe("t and fmtTime as round-trip inverses (for on-the-hour times)", () => {
  it("converting to minutes and back gives an equivalent time", () => {
    expect(fmtTime(t("11:00"))).toBe("11am");
    expect(fmtTime(t("15:00"))).toBe("3pm");
  });
});
