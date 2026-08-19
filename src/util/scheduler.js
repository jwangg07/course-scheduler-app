/**
 * Checks whether two time slots conflict: share at least one
 * weekday AND [start, end) ranges must overlap.
 * @param {import("../../ubc-data/lib/ubcClient").CourseSection} a - first slot's info
 * @param {import("../../ubc-data/lib/ubcClient").CourseSection} b - second slot's info
 * @returns {boolean} true if the two slots collide
 */
export function overlaps(a, b) {
    const sharedDay = a.days.some((d) => b.days.includes(d));
    if (!sharedDay) return false;
    return a.start < b.end && b.start < a.end;
}

/**
 * @typedef {Object} ComponentGroup
 * @property {string} code - Course code (e.g. "CPSC_V 110")
 * @property {string} type - Type of course section (e.g. "Lecture")
 * @property {import("../../ubc-data/lib/ubcClient").CourseSection[]} options - list of options for this course & section type pair
 * @property {string} color - Color of course (e.g. "#3D7068")
 */

/**
 * Creates one group per (course, component type) pair from selected courses
 *  — e.g. selecting CPSC 110 produces a Lecture group and a Laboratory group. 
 * Helper used by {@link generateSchedules}.
 * @param {import("../api/ubcApi").Course[]} courseList - Full list of available course objects to search within.
 * @returns {ComponentGroup[]} array of component groups to backtrack over
 */
function buildGroups(courseList) {
    const groups = [];
    for (const course of courseList) {
        for (const [type, options] of Object.entries(course.components)) {
            groups.push({ code: course.code, type, options, color: course.color });
        }
    }
    return groups;
}

/**
 * @typedef {Object} ScheduleEntry
 * @property {string} code - The course this entry belongs to, (e.g. "CPSC_V 110")
 * @property {string} type - Component type, (e.g. "Lecture")
 * @property {string} color - Course color (e.g. "#3D7068")
 * @property {import("../../ubc-data/lib/ubcClient").CourseSection} slot - 
 */

/**
 * Backtracking search over every (course, component type) group, picking
 * one option per group and skipping any option that conflicts with
 * sections already chosen earlier in the current branch. Stops once
 * `cap` valid schedules have been found.
 * @param {import("../api/ubcApi").Course[]} filteredCourses - Full course objects (post-filtering) to draw sections from
 * @param {number} [cap=100] - Maximum number of schedules to return
 * @returns {ScheduleEntry[][]} Array of conflict-free schedules; [] if no valid combination exists
 * ScheduleEntry[i] is a array (group) of specific course sections
 */
export function generateSchedules(filteredCourses, cap = 100) {
    const groups = buildGroups(filteredCourses);
    const results = [];

    /**
     * Backtracking search to produce all valid, non-conflicting schedules
     * @param {ScheduleEntry[]} chosen - Course sections chosen for current schedule
     * @returns {void} Modifies {@link results}
     */
    function backtrack(chosen) {
        const sectionsChosen = chosen.length;

        if (results.length >= cap) return;

        if (sectionsChosen === groups.length) {
            results.push([...chosen]);
            return;
        }

        const group = groups[sectionsChosen];
        for (const opt of group.options) {
            const conflict = chosen.some((c) => overlaps(c.slot, opt));
            if (conflict) continue;

            chosen.push({ code: group.code, type: group.type, slot: opt, color: group.color });
            backtrack(chosen);
            chosen.pop();

            if (results.length >= cap) return;
        }
    }
    backtrack([]);
    console.log(results);
    return results;
}
