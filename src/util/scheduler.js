// True only if two sections share a weekday AND their time ranges overlap on that day
export function overlaps(a, b) {
    const sharedDay = a.days.some((d) => b.days.includes(d));
    if (!sharedDay) return false;
    return a.start < b.end && b.start < a.end;
}

// Turns selected course codes into a flat list of (course, component type)
// groups — e.g. selecting CPSC 110 produces a LEC group and a LAB group
function buildGroups(selectedCodes, courseList) {
    const groups = [];
    for (const code of selectedCodes) {
        const course = courseList.find((c) => c.code === code);
        for (const [type, options] of Object.entries(course.components)) {
            // filter out options that don't have meeting times
            const filtered_options = options.filter((option) => option.days.length !== 0);

            groups.push({ courseCode: code, type, options: filtered_options, color: course.color });
        }
    }
    return groups;
}

// Backtracking search: tries one option per group, left to right, skipping
// any option that conflicts with what's already been chosen
export function generateSchedules(selectedCodes, courseList, cap = 100) {
    for (const course of courseList) console.log(course);
    const groups = buildGroups(selectedCodes, courseList);
    console.log(`groups:`);
    for (const g of groups) console.log(g);
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
