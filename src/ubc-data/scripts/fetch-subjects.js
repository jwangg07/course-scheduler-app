// node scripts/fetch-subjects.js

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "https://courses.students.ubc.ca/jsonapi/node/course";
// Test min / max ids using https://courses.students.ubc.ca/jsonapi/node/course?filter[field_subject.meta.drupal_internal__target_id]={ID_NUMBER}
const MIN_ID = 1475;
const MAX_ID = 1953;
const PACK_SIZE = 5; // size of request at one time
const DELAY = 150; // pause between batches

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetches one course for a given subject ID and extracts course code and number
// Returns null if there's no course at this subject ID
async function fetchSubjectInfo(subjectId) {
	const url =
		`${BASE}?filter[field_subject.meta.drupal_internal__target_id]=${subjectId}` +
		`&fields[node--course]=field_course_code,field_course_number` +
		`&page[limit]=1`;

	const res = await fetch(url);
	if (!res.ok) {
		console.warn(`subject ${subjectId}: HTTP ${res.status}, skipping`);
		return null;
	}

	const json = await res.json();
	if (!json.data || json.data.length === 0) return null;

	const { field_course_code, field_course_number } = json.data[0].attributes;
	if (!field_course_code || !field_course_number) return null;

	// "CPSC_V 100" -> "CPSC_V"
	const rawCode = field_course_code.slice(0, field_course_code.length - field_course_number.length).trim();
	if (!rawCode) return null;

	return rawCode;
}

async function main() {
	const subjects = {}; // code -> course code
	const ids = [];
	for (let id = MIN_ID; id <= MAX_ID; id++) ids.push(id);

	console.log(`Scanning ${ids.length} subject IDs (${MIN_ID}-${MAX_ID})...`);

	for (let i = 0; i < ids.length; i += PACK_SIZE) {
		const batch = ids.slice(i, i + PACK_SIZE);
		const results = await Promise.all(batch.map((id) => fetchSubjectInfo(id)));

		batch.forEach((id, j) => {
			const code = results[j];
			if (!code) return;

			subjects[code] = id;
			console.log(`${id} -> ${code}`);
		});

		await sleep(DELAY);
	}

	const outPath = fileURLToPath(new URL("../data/subjects.json", import.meta.url));
	await writeFile(outPath, JSON.stringify(subjects, null, 2));

	console.log(`\nSaved ${Object.keys(subjects).length} subjects to data/subjects.json`);
}

main();
