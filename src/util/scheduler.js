/**
 * @typedef {Object} SectionSlot
 * @property {string} id - Unique section identifier.
 * @property {string} label - Display label (section number e.g. "L1A").
 * @property {string[]} days - Meeting days (e.g. `["M", "W"]`).
 * @property {string} status - Section status (e.g. "Waitlist")
 * @property {number} start - Start time in minutes since midnight.
 * @property {number} end - End time in minutes since midnight.
 */

/**
 * @typedef {Object} ScheduleEntry
 * @property {string} courseCode - The course this entry belongs to.
 * @property {string} type - Component type, e.g. "LEC", "LAB", "TUT".
 * @property {SectionSlot} slot - The chosen section for this component.
 * @property {string} color - The course's assigned display color.
 */

/**
 * @typedef {Object} Course
 * @property {string} code - Course code (e.g. "CPSC_V 110")
 * @property {string} color - Course color (e.g. "#3D7068")
 * @property {Object<string, SectionSlot[]>} components - List of sections organized by section type
 * @property {string} title - Title of course (e.g. "CPSC_V 110")
 */

/**
 * @typedef {Object} ComponentGroup
 * @property {string} courseCode - Course code (e.g. "CPSC_V 110")
 * @property {string} type - Type of course section (e.g. "Lecture")
 * @property {Object<string, string, string[]} options - <id, label, days>
 * @property {string} color - Color of course (e.g. "#3D7068")
 */

/**
 * Checks whether two time slots conflict: share at least one
 * weekday AND [start, end) ranges must overlap.
 * @param {SectionSlot} a - first slot's info
 * @param {SectionSlot} b - second slot's info
 * @returns {boolean} true if the two slots collide
 */
export function overlaps(a, b) {
    const sharedDay = a.days.some((d) => b.days.includes(d));
    if (!sharedDay) return false;
    return a.start < b.end && b.start < a.end;
}

/**
 * Creates one group per (course, component type) pair from selected courses
 *  — e.g. selecting CPSC 110 produces a LEC group and a LAB group. 
 * Helper used by generateSchedules.
 * @param {string[]} selectedCodes - Course codes the user wants scheduled (e.g. "CPSC_V 110")
 * @param {Course[]} courseList - Full list of available course objects to search within.
 * @returns {ComponentGroup[]} array of component groups to backtrack over
 */
function buildGroups(selectedCodes, courseList) {
    const groups = [];
    for (const code of selectedCodes) {
        const course = courseList.find((c) => c.code === code);
        for (const [type, options] of Object.entries(course.components)) {

            groups.push({ courseCode: code, type, options, color: course.color });
        }
    }
    return groups;
}

/**
 * Backtracking search over every (course, component type) group, picking
 * one option per group and skipping any option that conflicts with
 * sections already chosen earlier in the current branch. Stops once
 * `cap` valid schedules have been found.
 * @param {string[]} selectedCodes - Course codes to generate schedules for
 * @param {Course[]} courseList - Full course objects (post-filtering) to draw sections from
 * @param {number} [cap=100] - Maximum number of schedules to return
 * @returns {ScheduleEntry[][]} Array of conflict-free schedules; [] if no valid combination exists
 */
export function generateSchedules(selectedCodes, courseList, cap = 100) {
    const groups = buildGroups(selectedCodes, courseList);
    const results = [];

    function backtrack(i, chosen) {
        if (results.length >= cap) return;

        if (i === groups.length) {
            results.push([...chosen]);
            return;
        }

        const group = groups[i];
        for (const opt of group.options) {
            const conflict = chosen.some((c) => overlaps(c.slot, opt));
            if (conflict) continue;

            chosen.push({ courseCode: group.courseCode, type: group.type, slot: opt, color: group.color });
            backtrack(i + 1, chosen);
            chosen.pop();

            if (results.length >= cap) return;
        }
    }
    backtrack(0, []);
    return results;
}
