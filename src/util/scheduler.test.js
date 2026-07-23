import { describe, it, expect } from "vitest";
import { overlaps, generateSchedules } from "./scheduler.js";

// A set of fake courses just for these tests
const courseA = {
  code: "TEST 100",
  color: "#000000",
  components: {
    LEC: [
      { id: "A-L1", label: "L1", days: ["M", "W"], start: 540, end: 600 }, // 9:00-10:00
      { id: "A-L2", label: "L2", days: ["T", "R"], start: 660, end: 720 }, // 11:00-12:00
    ],
  },
};

const courseB = {
  code: "TEST 200",
  color: "#000000",
  components: {
    // Only one LEC option, and it exactly matches courseA's L1
    // forces any valid schedule to use courseA's L2 instead.
    LEC: [{ id: "B-L1", label: "L1", days: ["M", "W"], start: 540, end: 600 }],
    LAB: [{ id: "B-B1", label: "B1", days: ["F"], start: 600, end: 660 }],
  },
};

// Its two forced sections exactly collide with BOTH of
// courseA's LEC options, pairing courseA with courseC should be
// unsolvable no matter which option courseA's LEC picks.
const courseC = {
  code: "TEST 300",
  color: "#000000",
  components: {
    LEC: [{ id: "C-L1", label: "L1", days: ["M", "W"], start: 540, end: 600 }], // collides with A-L1
    TUT: [{ id: "C-T1", label: "T1", days: ["T", "R"], start: 660, end: 720 }], // collides with A-L2
  },
};

const ALL_COURSES = [courseA, courseB, courseC];

describe("overlaps", () => {
  it("detects a same-day, overlapping time range as a conflict", () => {
    const a = { days: ["M"], start: 540, end: 600 };
    const b = { days: ["M"], start: 570, end: 630 }; // overlaps 570-600
    expect(overlaps(a, b)).toBe(true);
  });

  it("does not flag two sections on completely different days", () => {
    const a = { days: ["M"], start: 540, end: 600 };
    const b = { days: ["T"], start: 540, end: 600 }; // same time, different day
    expect(overlaps(a, b)).toBe(false);
  });

  it("does not flag back-to-back sections that only touch at the boundary", () => {
    const a = { days: ["M"], start: 540, end: 600 };
    const b = { days: ["M"], start: 600, end: 660 }; // starts exactly when a ends
    expect(overlaps(a, b)).toBe(false);
  });

  it("flags one section fully contained inside another", () => {
    const a = { days: ["M"], start: 540, end: 720 };
    const b = { days: ["M"], start: 600, end: 630 };
    expect(overlaps(a, b)).toBe(true);
  });

  it("only requires ONE shared day to conflict, even with multiple days listed", () => {
    const a = { days: ["M", "W", "F"], start: 540, end: 600 };
    const b = { days: ["F"], start: 570, end: 630 }; // only Friday overlaps
    expect(overlaps(a, b)).toBe(true);
  });
});

describe("generateSchedules", () => {
  it("returns every option when a single course has no conflicts to avoid", () => {
    const results = generateSchedules(["TEST 100"], ALL_COURSES);
    expect(results).toHaveLength(2); // both of courseA's LEC options are individually valid
  });

  it("avoids a conflicting section by using the other available option", () => {
    const results = generateSchedules(["TEST 100", "TEST 200"], ALL_COURSES);
    expect(results).toHaveLength(1);

    const chosenLec = results[0].find((entry) => entry.courseCode === "TEST 100" && entry.type === "LEC");
    expect(chosenLec.slot.id).toBe("A-L2"); // NOT A-L1, since that collides with courseB
  });

  it("returns an empty array when every combination conflicts", () => {
    const results = generateSchedules(["TEST 100", "TEST 300"], ALL_COURSES);
    expect(results).toEqual([]);
  });

  it("never returns a schedule containing two entries that actually overlap", () => {
    // for every schedule generated across all three courses, no two
    // chosen sections should conflict with each other. 
    const results = generateSchedules(["TEST 100", "TEST 200"], ALL_COURSES);

    for (const schedule of results) {
      for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
          expect(overlaps(schedule[i].slot, schedule[j].slot)).toBe(false);
        }
      }
    }
  });

  it("respects the cap parameter instead of returning unbounded results", () => {
    // A course with many non-conflicting options
    const manyOptions = {
      code: "TEST 400",
      color: "#000000",
      components: {
        LEC: Array.from({ length: 20 }, (_, i) => ({
          id: `many-${i}`,
          label: String(i),
          days: ["M"],
          start: 480 + i * 30,
          end: 480 + i * 30 + 20, // short, non-overlapping slots
        })),
      },
    };

    const results = generateSchedules(["TEST 400"], [manyOptions], 5);
    expect(results).toHaveLength(5);
  });
});
