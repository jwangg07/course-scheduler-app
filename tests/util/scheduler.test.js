import { beforeEach, describe, test, expect } from "vitest";
import { overlaps, generateSchedules } from "../../src/util/scheduler.js";

let course = {};

beforeEach(() => {
    course = {
        title: "COURSE",
        code: "COURSE 100",
        color: "#fff",
    };
})

function make_section({ label = "S", days, start = 0, end = 0, status = "Open" }) {
    return { label, days, start, end, status };
}

// Asserts that no two chosen sections in a generated schedule conflict 
function assertInternallyConsistent(schedule) {
    for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
            expect(overlaps(schedule[i].slot, schedule[j].slot)).toBe(false);
        }
    }
}

describe("overlaps()", () => {
    test("same day, overlapping time range", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["m"], start: 570, end: 630 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("same day, overlapping time range edge case", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["m"], start: 599, end: 630 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("same day, not overlapping time range edge case", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["m"], start: 601, end: 630 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("same time, on different days", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["t"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("same time, many days, all days unique", () => {
        const a = { days: ["m", "w"], start: 540, end: 600 };
        const b = { days: ["t", "th"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("same time, many days, one shared day", () => {
        const a = { days: ["m", "w"], start: 540, end: 600 };
        const b = { days: ["t", "w", "th"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("same time, same day", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["m"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("same time, same days", () => {
        const a = { days: ["m", "th"], start: 540, end: 600 };
        const b = { days: ["m", "th"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("same day, back to back", () => {
        const a = { days: ["m"], start: 540, end: 600 };
        const b = { days: ["m"], start: 600, end: 660 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("many days, back to back", () => {
        const a = { days: ["m", "w", "f"], start: 540, end: 600 };
        const b = { days: ["m", "t", "w"], start: 600, end: 660 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("one section fully contained inside another", () => {
        const a = { days: ["m"], start: 540, end: 720 };
        const b = { days: ["m"], start: 600, end: 630 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("one shared day conflict for multiple-day section", () => {
        const a = { days: ["m", "w", "f"], start: 540, end: 600 };
        const b = { days: ["f"], start: 570, end: 630 };
        expect(overlaps(a, b)).toBe(true);
    });

    test("two async sections", () => {
        const a = { days: [], start: 0, end: 0 };
        const b = { days: [], start: 0, end: 1440 };
        expect(overlaps(a, b)).toBe(false);
    });

    test("async section against a timed section", () => {
        const a = { days: [], start: 0, end: 1440 };
        const b = { days: ["m"], start: 540, end: 600 };
        expect(overlaps(a, b)).toBe(false);
    });
});

describe("generateSchedules(): single course & component type", () => {
    course.components = {
        Lecture: [
            make_section({ label: "L1", days: ["m"], start: 540, end: 600 }),
            make_section({ label: "L2", days: ["m"], start: 570, end: 630 }), // overlaps L1
            make_section({ label: "L3", days: ["t"], start: 540, end: 600 }),
        ]
    };

    const results = generateSchedules([course]);

    test("one group, one schedule per option", () => {
        expect(results).toHaveLength(3);
    });

    test("keep options that conflict with eachother in same group", () => {
        const chosenLabels = new Set(results.map((schedule) => schedule[0].slot.label));
        expect(chosenLabels).toEqual(new Set(["L1", "L2", "L3"]));
    });
});


describe("generateSchedules(): async / no-meeting-time sections", () => {
    test("a course's only section for a type is fully async", () => {
        course.components = {
            Lecture: [make_section({ label: "Async", days: [] })],
        };

        const results = generateSchedules([course]);
        expect(results).toHaveLength(1);
        expect(results[0][0].slot.label).toBe("Async");
        expect(results[0][0].slot.days).toHaveLength(0);
    });

    test("mix async and timed sections", () => {
        course.components = {
            Lecture: [
                make_section({ label: "Async", days: [] }),
                make_section({ label: "Timed", days: ["m"], start: 540, end: 600 }),
            ]
        }

        const results = generateSchedules([course]);
        expect(results).toHaveLength(2);
        const chosenLabels = new Set(results.map((schedule) => schedule[0].slot.label));
        expect(chosenLabels).toEqual(new Set(["Async", "Timed"]));
    });

    test("one component type is async-only and another has real meeting times (e.g. SCIE_V 113)", () => {
        course.components = {
            Lecture: [make_section({ label: "L1", days: [] })],
            Seminar: [
                make_section({ label: "SA", days: ["m"], start: 540, end: 600 }),
                make_section({ label: "SB", days: ["t"], start: 660, end: 720 }),
            ]
        }

        const results = generateSchedules([course]);
        expect(results).toHaveLength(2); // one per Seminar option
        for (const schedule of results) {
            expect(schedule).toHaveLength(2); // Lecture + Seminar
            assertInternallyConsistent(schedule);

            const Lecture = schedule.find((e) => e.type === "Lecture");
            const seminar = schedule.find((e) => e.type === "Seminar");
            expect(Lecture.slot.label).toBe("L1");
            expect(["SA", "SB"]).toContain(seminar.slot.label);
        }
    });
});

describe("generateSchedules(): component with no sections", () => {
    test("no schedules when a type has zero options", () => {
        course.components = {
            Lecture: []
        }

        const results = generateSchedules([course]);
        expect(results).toEqual([]);
    });
});

describe("generateSchedules(): one course, multiple component types", () => {
    test("all non conflicting sections", () => {
        course.components = {
            Lecture: [make_section({ label: "LA", days: ["m"], start: 540, end: 600 })],
            Laboratory: [
                make_section({ label: "LabA", days: ["t"], start: 540, end: 600 }),
                make_section({ label: "LabB", days: ["w"], start: 540, end: 600 }),
            ],
            Discussion: [
                make_section({ label: "TutA", days: ["th"], start: 540, end: 600 }),
                make_section({ label: "TutB", days: ["f"], start: 540, end: 600 }),
            ]
        }
        const results = generateSchedules([course]);
        expect(results).toHaveLength(4);

        for (const schedule of results) {
            expect(schedule).toHaveLength(3);
            assertInternallyConsistent(schedule);
        }

        const combos = new Set(
            results.map((schedule) => {
                const lab = schedule.find((e) => e.type === "Laboratory").slot.label;
                const tut = schedule.find((e) => e.type === "Discussion").slot.label;
                return `${lab}-${tut}`;
            })
        );
        expect(combos).toEqual(new Set(["LabA-TutA", "LabA-TutB", "LabB-TutA", "LabB-TutB"]));

    });
});

describe("generateSchedules(): multiple courses, multiple component types", () => {
    const courseA = {
        code: "course 100",
        color: "#fff",
        components: {
            Lecture: [
                make_section({ label: "L1", days: ["m", "w"], start: 540, end: 600 }),
                make_section({ label: "L2", days: ["t", "th"], start: 660, end: 720 }),
            ],
        },
    };

    const courseB = {
        code: "course 200",
        color: "#fff",
        components: {
            // Collides with L1 only, forcing L2 to be chosen instead
            Lecture: [make_section({ label: "L1", days: ["m", "w"], start: 540, end: 600 })],
            Laboratory: [make_section({ label: "B1", days: ["f"], start: 600, end: 660 })],
        },
    };

    const courseC = {
        code: "course 300",
        color: "#fff",
        components: {
            // Collides with BOTH of courseA's Lecture options, making courseA + courseC unsolvable
            Lecture: [make_section({ label: "L1", days: ["m", "w"], start: 540, end: 600 })], // collides with courseA's L1
            Discussion: [make_section({ label: "T1", days: ["t", "th"], start: 660, end: 720 })], // collides with courseA's L2
        },
    };

    test("single course, no collisions", () => {
        const results = generateSchedules([courseA]);
        expect(results).toHaveLength(2);
    });

    test("two courses, one collision", () => {
        const results = generateSchedules([courseA, courseB]);
        expect(results).toHaveLength(1);

        const chosenLecture = results[0].find((e) => e.code === "course 100" && e.type === "Lecture");
        expect(chosenLecture.slot.days).toEqual(["t", "th"]); // this is the L2 slot, distinguished by its unique time
        expect(chosenLecture.slot.start).toBe(660);

        expect(results.length).toBeGreaterThan(0);
        for (const schedule of results) {
            assertInternallyConsistent(schedule);
        }
    });

    test("two courses, all collisions", () => {
        const results = generateSchedules([courseA, courseC]);
        expect(results).toEqual([]);
    });

    test("three courses, first two courses collide fully", () => {
        const results = generateSchedules([courseA, courseB, courseC]);
        expect(results).toEqual([]);
    });
});

describe("generateSchedules(): cap parameter", () => {
    const manyOptionsCourse = {
        code: "CAP 100",
        color: "#fff",
        components: {
            Lecture: Array.from({ length: 20 }, (_, i) =>
                make_section({ label: String(i), days: ["m"], start: 480 + i * 30, end: 480 + i * 30 + 20 })
            ),
        },
    };

    test("cap smaller than the total number of combinations", () => {
        const results = generateSchedules([manyOptionsCourse], 5);
        expect(results).toHaveLength(5);
    });

    test("stops at the cap", () => {
        const results = generateSchedules([manyOptionsCourse], 50);
        expect(results).toHaveLength(20); // manyOptionsCourse only has 20 options in total
    });

    test("default cap (100)", () => {
        const results = generateSchedules([manyOptionsCourse]);
        expect(results).toHaveLength(20);
    });

    test("returns results in order", () => {
        const results = generateSchedules([manyOptionsCourse], 5);
        const labels = results.map((schedule) => schedule[0].slot.label);
        expect(labels).toEqual(["0", "1", "2", "3", "4"]);
    });

    test("returns no schedules when cap is 0", () => {
        const results = generateSchedules([manyOptionsCourse], 0);
        expect(results).toEqual([]);
    });
});

describe("generateSchedules(): shape of returned entries", () => {
    test("tags each entry with code, type, slot, and the course's color", () => {
        course.components = {
            Lecture: [make_section({ label: "L1", days: ["m"], start: 540, end: 600 })],
        };

        const results = generateSchedules([course]);
        const [entry] = results[0];

        expect(entry.code).toBe("COURSE 100");
        expect(entry.type).toBe("Lecture");
        expect(entry.color).toBe("#fff");
        expect(entry.slot).toEqual(course.components.Lecture[0]);
    });

    test("keeps course color on entries for multiple courses", () => {
        const colorA = {
            code: "COLOR A",
            color: "#AAAAAA",
            components: { Lecture: [make_section({ label: "A1", days: ["m"], start: 540, end: 600 })] },
        };
        const colorB = {
            code: "COLOR B",
            color: "#BBBBBB",
            components: { Lecture: [make_section({ label: "B1", days: ["t"], start: 540, end: 600 })] },
        };

        const results = generateSchedules([colorA, colorB]);
        expect(results).toHaveLength(1);

        const [schedule] = results;
        expect(schedule.find((e) => e.code === "COLOR A").color).toBe("#AAAAAA");
        expect(schedule.find((e) => e.code === "COLOR B").color).toBe("#BBBBBB");
    });
});

describe("generateSchedules(): edge cases", () => {
    test("returns empty schedule when no courses are passed", () => {
        const results = generateSchedules([]);
        expect(results).toEqual([[]]);
    });

    test("throws error if course is missing components property", () => {
        const brokenCourse = { code: "COURSE 100", color: "#fff" };
        expect(() => generateSchedules([brokenCourse])).toThrow();
    });
});