// To run: node scripts/fetch-instructional_method.js

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_URL = "https://courses.students.ubc.ca/jsonapi/taxonomy_term/instructional_method";

/**
 * Fetches instructional-method taxonomy from UBC's Drupal JSON:API
 * and writes an `{ id: name }` lookup table to `data/instructional_method.json`.
 * @returns {Promise<null|void>} Resolves with `null` early if the request fails
 *   or returns no data; otherwise resolves `undefined` after writing the file.
 */
async function main() {
    const instructional_method = {};

    const res = await fetch(API_URL);
    if (!res.ok) {
        console.warn(`HTTP ${res.status}, skipping`);
        return null;
    }

    const json = await res.json();
    if (!json.data || json.data.length === 0) return null;

    // fetch each instructional_method type and id in data
    json.data.forEach(term => {
        const type = term.attributes.name;
        const id = term.attributes.drupal_internal__tid;

        instructional_method[id] = type;
        console.log(`${id} -> ${type}`)
    });

    const outPath = fileURLToPath(new URL("../data/instructional_method.json", import.meta.url));
    await writeFile(outPath, JSON.stringify(instructional_method, null, 2));

    console.log(`\nSaved ${Object.keys(instructional_method).length} instructional_method to data/instructional_method.json`);
}

main();