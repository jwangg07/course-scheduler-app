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

const statusPath = fileURLToPath(new URL("../data/status.json", import.meta.url));
const STATUS = JSON.parse(readFileSync(statusPath, "utf-8"));

// // Drupal's day code conversion
// const DAY_MAP = { m: "M", t: "T", w: "W", th: "R", f: "F" };

// Terms (from data/terms.json) -> array
export function getAvailableTerms() {
    return Object.entries(TERMS).map(([name, id]) => ({ id, name }));
}

// dept code -> numeric subject ID
function resolveSubjectId(dept) {
    const id = SUBJECTS[dept];
    if (!id) {
        throw new Error(`Unknown subject code "${dept}".`); // run scripts/fetch-subjects.js if data/subjects.json is empty or missing this one
    }
    return id;
}

// fetch sections for a resolved course + term
export async function getCourseSections(dept, course, termId) {
    const resolvedTermId = termId ?? Object.values(TERMS)[0];
    if (!resolvedTermId) throw new Error("No term specified"); // data/terms.json empty
    const cacheKey = `sections-${dept}-${course}-${resolvedTermId}`;
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const subjectId = resolveSubjectId(dept);

    const url =
        `${BASE}/node/section` +
        `?fields[node--section]=title,field_section_number,field_start_time,field_end_time,field_days,field_instructional_method,field_status` +
        `&filter[field_course.field_subject.meta.drupal_internal__target_id]=${subjectId}` +
        `&filter[field_course.field_course_number]=${encodeURIComponent(course)}` +
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
            days: attrs.field_days ?? [], 
            start: Math.round(attrs.field_start_time / 60), // seconds -> minutes
            end: Math.round(attrs.field_end_time / 60),
            status: resolveStatus(section),
        };

        const componentType = resolveComponentType(section);
        if (!sections[componentType]) sections[componentType] = [];
        sections[componentType].push(entry);
    }

    return sections;
}

// Resolve status type by drupal internal id
function resolveStatus(section) {
    return STATUS[section.relationships.field_status.data.meta.drupal_internal__target_id];
}

// Resolve component type by drupal internal id
function resolveComponentType(section) {
    return INSTRUCTIONAL_METHOD[section.relationships.field_instructional_method.data.meta.drupal_internal__target_id];
}