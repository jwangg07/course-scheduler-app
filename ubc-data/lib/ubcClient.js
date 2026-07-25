import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cacheGet, cacheSet } from "./cache.js";

const BASE = "https://courses.students.ubc.ca/jsonapi";

// ID reference tables
const subjectsPath = fileURLToPath(new URL("../data/subjects.json", import.meta.url));
const SUBJECTS = JSON.parse(readFileSync(subjectsPath, "utf-8"));

const termsPath = fileURLToPath(new URL("../data/terms.json", import.meta.url));
const TERMS = JSON.parse(readFileSync(termsPath, "utf-8"));

const instructional_methodPath = fileURLToPath(new URL("../data/instructional_method.json", import.meta.url));
const INSTRUCTIONAL_METHOD = JSON.parse(readFileSync(instructional_methodPath, "utf-8"));

// Drupal's day code conversion
const DAY_MAP = { m: "M", t: "T", w: "W", th: "R", f: "F" };

// Terms (from data/terms.json) -> array
export function getAvailableTerms() {
    return Object.entries(TERMS).map(([name, id]) => ({ id, name }));
}

// dept code -> numeric subject ID
function resolveSubjectId(dept) {
    const id = SUBJECTS[dept];
    if (!id) {
        throw new Error(`Unknown subject code "${dept}" — run scripts/fetch-subjects.js if data/subjects.json is empty or missing this one`);
    }
    return id;
}

// (subject ID, course number) -> course UUID
async function resolveCourseId(dept, course) {
    const cacheKey = `course-id-${dept}-${course}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const subjectId = resolveSubjectId(dept);

    const url =
        `${BASE}/node/course` +
        `?filter[field_subject.meta.drupal_internal__target_id]=${subjectId}` +
        `&filter[field_course_number]=${encodeURIComponent(course)}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Course lookup failed: ${res.status}`);
    const json = await res.json();

    if (!json.data || json.data.length === 0) {
        throw new Error(`No course found for ${dept} ${course}`);
    }

    const courseId = json.data[0].id;
    cacheSet(cacheKey, courseId, 7 * 24 * 60 * 60 * 1000); // course UUIDs are effectively permanent
    return courseId;
}

// fetch sections for a resolved course + term
export async function getCourseSections(dept, course, termId) {
    const resolvedTermId = termId ?? Object.values(TERMS)[0];
    if (!resolvedTermId) throw new Error("No term specified and data/terms.json is empty");
    const cacheKey = `sections-${dept}-${course}-${resolvedTermId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const courseId = await resolveCourseId(dept, course);

    const url =
        `${BASE}/node/section` +
        `?fields[node--section]=title,field_section_number,field_start_time,field_end_time,field_days,field_instructional_method,field_status` +
        `&filter[field_course.id]=${courseId}` +
        `&filter[field_is_visible]=1` +
        `&filter[field_academic_term.meta.drupal_internal__target_id]=${resolvedTermId}` +
        `&sort=field_section_number`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Section fetch failed: ${res.status}`);
    const json = await res.json();

    const result = parseSections(json, dept, course);
    cacheSet(cacheKey, result);
    return result;
}

// Turns a raw JSON:API response into { title, sections: { LEC: [...], ... } }
// matching the shape src/App.jsx will build a course object from.
function parseSections(json, dept, course) {
    const includedById = new Map((json.included ?? []).map((item) => [item.id, item]));
    const sections = { LEC: [], LAB: [], TUT: [] };
    let code = `${dept} ${course}`;
    let title = null;

    for (const section of json.data) {
        const attrs = section.attributes;

        // Title comes back as "<Course name> :: <year> :: Sec <number>" —
        if (!title && attrs.title) {
            title = attrs.title.split("::")[0].trim();
        }

        const entry = {
            id: attrs.title,
            label: attrs.field_section_number,
            days: (attrs.field_days ?? []).map((d) => DAY_MAP[d] ?? d),
            start: Math.round(attrs.field_start_time / 60), // seconds -> minutes
            end: Math.round(attrs.field_end_time / 60),
        };

        const componentType = resolveComponentType(section);
        if (!sections[componentType]) sections[componentType] = [];
        sections[componentType].push(entry);
    }

    return sections;
}

// Resolve component type by drupal internal id
function resolveComponentType(section) {
    return normalizeComponentLabel(INSTRUCTIONAL_METHOD[section.relationships.field_instructional_method.data.meta.drupal_internal__target_id]);

    console.warn(`Could not resolve instructional method for section ${section.id}, defaulting to LEC`);
    return "LEC";
}

// Format label to displayed label
function normalizeComponentLabel(label) {
    const normalized = label.toLowerCase();
    if (label === "Laboratory") return "LAB";
    if (label === "Discussion") return "TUT";
    return "LEC";
    // TODO: Add rest of component lables
}
