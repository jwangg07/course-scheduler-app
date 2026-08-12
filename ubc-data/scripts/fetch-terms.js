// node scripts/fetch-terms.js

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_URL = "https://courses.students.ubc.ca/jsonapi/taxonomy_term/term";

/**
 * Fetches the full term taxonomy from UBC's Drupal JSON:API and writes an
 * `{ name: id }` lookup table to `data/terms.json`.
 * @returns {Promise<null|void>} Resolves with `null` early if the request fails
 *   or returns no data; otherwise resolves `undefined` after writing the file.
 */
async function main() {
    const terms = {};

    const res = await fetch(API_URL);
    if (!res.ok) {
        console.warn(`HTTP ${res.status}, skipping`);
        return null;
    }

    const json = await res.json();
    if (!json.data || json.data.length === 0) return null;

    // fetch each term name and id in data
    json.data.forEach(term => {
        const name = term.attributes.name;
        const id = term.attributes.drupal_internal__tid;

        terms[name] = id;
        console.log(`${id} -> ${name}`)
    });

    const outPath = fileURLToPath(new URL("../data/terms.json", import.meta.url));
    await writeFile(outPath, JSON.stringify(terms, null, 2));

    console.log(`\nSaved ${Object.keys(terms).length} terms to data/terms.json`);
}

main();