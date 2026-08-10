import { colorForIndex } from "../util/palette.js";

// backend location
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

// GET /api/terms -> [{ id, name }, ...]
export async function fetchTerms() {
    await new Promise((r) => setTimeout(r, 5000)); // TEMP: simulate slow load
    const res = await fetch(`${API_BASE}/api/terms`);
    if (!res.ok) throw new Error(`Failed to load terms: ${res.status}`);
    const json = await res.json();
    return json.terms;
}

// Fetches one course's sections for a given term, and formats the result
// into what the scheduler/UI expects
// `colorIndex` picks which palette color this course gets, based on
// how many courses have already been added passed in by App.jsx
export async function fetchCourse(dept, courseNumber, termId, colorIndex) {
    const url = `${API_BASE}/api/sections/${dept}/${courseNumber}?term=${termId}`;
    const res = await fetch(url);

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load ${dept} ${courseNumber} (${res.status})`);
    }

    const json = await res.json();

    return {
        code: `${dept} ${courseNumber}`,
        title: json.title || `${dept} ${courseNumber}`,
        color: colorForIndex(colorIndex),
        components: json.sections, // { LEC: [...], LAB: [...], TUT: [...] } — same shape as the old fake data
    };
}
