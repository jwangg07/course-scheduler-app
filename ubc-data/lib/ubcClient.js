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

/** 
 * @typedef {Object} CourseSection
 * @property {string} label - Section number (e.g. "L10")
 * @property {string[]} days - Days of the week the section meets (e.g. ["t", "th"])
 * @property {number} start - Start time (minutes from midnight) (e.g. 570)
 * @property {number} end - End time (minutes from midnight) (e.g. 660)
 * @property {string} status - Current status of the section (e.g. "Open")
 */

/**
 * Returns all terms as an array from `data/terms.json`.
 * @returns {{id: number, name: string}[]} All available terms.
 */
export function getAvailableTerms() {
    return Object.entries(TERMS).map(([name, id]) => ({ id, name }));
}

/**
 * Resolves a subject code (e.g. "CPSC_V") to its numeric
 * Drupal subject ID, using the local `data/subjects.json` lookup table.
 * @param {string} dept - Subject code (e.g. "CPSC_V").
 * @returns {number} The corresponding numeric subject ID.
 * @throws {Error} If `dept` is not found in `data/subjects.json`
 */
function resolveSubjectId(dept) {
    const id = SUBJECTS[dept];
    if (!id) {
        throw new Error(`Unknown subject code "${dept}".`); // run scripts/fetch-subjects.js if data/subjects.json is empty or missing this one
    }
    return id;
}

/**
 * Fetches all sections for a given course in a given term, directly from UBC's Drupal 
 * @param {string} dept - Subject code (e.g. "CPSC_V").
 * @param {string} course - Course number (e.g. "110").
 * @param {number} [termId] - Numeric term ID; defaults to the first entry in `data/terms.json`.
 * @returns {{
 *   title: string,
 *   code: string,
 *   components: Object.<string, CourseSection[]>
 * }} Sections grouped by component type produced by {@link parseSections}. 
 * E.g. `{ "title": "Computation, Programs, and Programming", "code": "CPSC_V 110", "components": {} }`
 * @throws {Error} If no term can be resolved, the subject code is unknown, or the upstream fetch fails.
 */
export async function getCourseInfo(dept, course, termId) {
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
    if (json.data.length === 0) throw new Error(`Unknown course level for ${dept}: ${course}`);

    const components = parseSections(json);
    const code = `${dept} ${course}`;
    const title = json.data[0].attributes.title.split("::")[0].trim();
    const result = { title, code, components };

    cacheSet(cacheKey, result);
    return result;
}

/**
 * Transforms JSON:API `node/section` response into section data
 * @param {Object} json - Raw JSON:API response body from `node/section`.
 * @returns {Object.<string, CourseSection[]>} Sections grouped by component type. 
 */
function parseSections(json) {
    /* json example
    {
        jsonapi: { version: '1.1', meta: { links: [Object] } },
        data: [
                {
                    type: 'node--section',
                    id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                    links: [Object],
                    attributes: [Object],
                    relationships: [Object]
                },
                {
                    ...
                }, ...
    */
    const sections = {};

    for (const section of json.data) {
        const attrs = section.attributes;

        const entry = {
            // id: attrs.title,
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

/**
 * Resolves a section's human-readable status (e.g. "Open") via the `data/status.json` lookup table.
 * @param {object} section - A single `node--section` JSON:API resource object.
 * @returns {string|undefined} The status name, or `undefined` if the ID isn't in the lookup table.
 */
function resolveStatus(section) {
    return STATUS[section.relationships.field_status.data.meta.drupal_internal__target_id];
}

/**
 * Resolves a section's component type (e.g. "Lecture") via the `data/instructional_method.json` lookup table.
 * @param {object} section - A single `node--section` JSON:API resource object.
 * @returns {string|undefined} The instructional method name, or `undefined` if the ID isn't in the lookup table.
 */
function resolveComponentType(section) {
    return INSTRUCTIONAL_METHOD[section.relationships.field_instructional_method.data.meta.drupal_internal__target_id];
}