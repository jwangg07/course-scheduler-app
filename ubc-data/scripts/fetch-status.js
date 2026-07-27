// node scripts/fetch-status.js

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_URL = "https://courses.students.ubc.ca/jsonapi/taxonomy_term/status";

async function main() {
    const status = {};

    const res = await fetch(API_URL);
    if (!res.ok) {
        console.warn(`HTTP ${res.status}, skipping`);
        return null;
    }

    const json = await res.json();
    if (!json.data || json.data.length === 0) return null;

    // fetch each status type and id in data
    json.data.forEach(term => {
        const type = term.attributes.name;
        const id = term.attributes.drupal_internal__tid;

        status[id] = type;
        console.log(`${id} -> ${type}`)
    });

    const outPath = fileURLToPath(new URL("../data/status.json", import.meta.url));
    await writeFile(outPath, JSON.stringify(status, null, 2));

    console.log(`\nSaved ${Object.keys(status).length} status to data/status.json`);
}

main();