import { colorForIndex } from "../util/palette.js";

// backend location
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Fetches the list of available terms from the backend.
 * @returns {Promise<Term[]>} list of { id, name } terms
 * @throws {Error} if the request fails (non-2xx response)
 */
export async function fetchTerms() {
    await new Promise((r) => setTimeout(r, 5000)); // TEMP: simulate slow load
    const res = await fetch(`${API_BASE}/api/terms`);
    if (!res.ok) throw new Error(`Failed to load terms: ${res.status}`);
    const json = await res.json();
    return json.terms;
}

/**
 * Fetches one course's sections for a given term and shapes the result
 * into the Course object the scheduler/UI expects.
 * @param {string} dept - subject code, e.g. "CPSC_V"
 * @param {string} courseNumber - course number, e.g. "110"
 * @param {number} termId - numeric term ID to fetch sections for
 * @param {number} colorIndex - index used to assign this course's palette color
 * @returns {Promise<Course>} a Course object with `components` grouped by type
 * @throws {Error} with a server-provided detail message if the fetch fails
 */
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
        components: json.sections,
    };
}

// POST the bug report to the backend, which relays it via Resend
export async function submitBugReport(email, description) {
    const res = await fetch(`${API_BASE}/api/bug-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, description }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.detail || `Failed to send bug report (${res.status})`);
    }

    return res.json();
}