export function overlaps(a, b) {
  const sharedDay = a.days.some((d) => b.days.includes(d));
  if (!sharedDay) return false;
  return a.start < b.end && b.start < a.end;
}

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

export function generateSchedules(selectedCodes, courseList, cap = 60) {
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
