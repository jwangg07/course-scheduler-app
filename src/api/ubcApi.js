import { colorForIndex } from "../util/palette.js";

// backend location
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Fetches the list of available terms from the backend.
 * @returns {Promise<{ id: number, name: string }[]>} List of available terms
 * @throws {Error} if the request fails (non-2xx response)
 */
export async function fetchTerms() {
    const res = await fetch(`${API_BASE}/api/terms`);
    if (!res.ok) {
        if (res.status === 429) throw new Error("Too many requests received. Please try again later or submit a bug report.");
        throw new Error(`Failed to load terms: ${res.status}`);
    }
    const json = await res.json();
    return json.terms;
}

/** 
 * @typedef {Object} Course
 * @property {string} title - Title of course (e.g. "Symbolic Logic")
 * @property {string} code - Course code (e.g. "PHIL_V 220")
 * @property {string} color - Course color (e.g. "#3D7068")
 * @property {Object.<string, import("../../ubc-data/lib/ubcClient.js").CourseSection[]>} components - 
 */

/**
 * Fetches one course's sections for a given term and shapes the result
 * into the Course object the scheduler/UI expects.
 * @param {string} dept - subject code, e.g. "CPSC_V"
 * @param {string} courseNumber - course number, e.g. "110"
 * @param {number} termId - numeric term ID to fetch sections for
 * @param {number} colorIndex - index used to assign this course's palette color
 * @returns {Promise<Course>} a Course object with `components` grouped by type. 
 * E.g. `{ title: 'Symbolic Logic', code: 'PHIL_V 220', components: {Lecture: Array(4)}, color: '#3D7068' }`
 * @throws {Error} with a server-provided detail message if the fetch fails
 */
export async function fetchCourse(dept, courseNumber, termId, colorIndex) {
    const url = `${API_BASE}/api/sections/${dept}/${courseNumber}?term=${termId}`;
    const res = await fetch(url);

    if (!res.ok) {
        if (res.status === 429) throw new Error("Too many requests received. Please try again later or submit a bug report.");
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Failed to load ${dept} ${courseNumber} (${res.status})`);
    }

    const json = await res.json();
    json.color = colorForIndex(colorIndex);

    return json;
}

/**
 * Submits a bug report to the backend, which relays it via Resend.
 * @param {string} email - Email address to contact
 * @param {string} description - Description of the bug
 * @returns {Promise<{ ok: true }>} Response from the backend
 * @throws {Error} with a server-provided error message if the request fails
 */
export async function submitBugReport(email, description) {
    const res = await fetch(`${API_BASE}/api/bug-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, description }),
    });

    if (!res.ok) {
        if (res.status === 429) throw new Error("Too many requests received. Please try again later.");
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.detail || `Failed to send bug report (${res.status})`);
    }

    return res.json();
}