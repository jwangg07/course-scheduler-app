import express from "express";
import cors from "cors";
import { getCourseSections, getAvailableTerms } from "./lib/ubcClient.js";
import { sendBugReportEmail } from "./lib/mailer.js";

const app = express();

app.use(cors({
    origin: ['https://course-scheduler-app-alpha.vercel.app', 'https://ubcschedules.vercel.app', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

/**
 * GET /api/terms
 * Returns the list of available terms for the term dropdown in the React app.
 * @route GET /api/terms
 * @returns {200} JSON body `{ terms: Array<{ id: number, name: string }> }`
 * @returns {502} JSON body `{ error: string, detail: string }` if the upstream fetch fails.
 */
app.get("/api/terms", async (req, res) => {
    try {
        const terms = await getAvailableTerms();
        res.json({ terms });
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: "Failed to fetch terms", detail: err.message });
    }
});

/**
 * GET /api/sections/:dept/:course
 * Returns section data for a given department + course number,
 * @route GET /api/sections/:dept/:course
 * @param {string} req.params.dept - Subject code (e.g. "CPSC").
 * @param {string} req.params.course - Course number, (e.g. "110").
 * @param {string} [req.query.term] - Numeric term ID as a string (e.g. "1454").
 * @returns {200} JSON body `{ dept: string, course: string, sections: object }`
 * @returns {502} JSON body `{ error: string, detail: string }` if the upstream fetch fails.
 */
app.get("/api/sections/:dept/:course", async (req, res) => {
    const { dept, course } = req.params;
    const termId = req.query.term ? Number(req.query.term) : undefined;

    try {
        const sections = await getCourseSections(dept.toUpperCase(), course, termId);
        res.json({ dept: dept.toUpperCase(), course, sections });
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: "Failed to fetch course data", detail: err.message });
    }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/bug-report  { email, description } -> { ok: true }
app.post("/api/bug-report", async (req, res) => {
    const { email, description } = req.body ?? {};

    if (!email || !EMAIL_RE.test(email)) {
        return res.status(400).json({ error: `A valid email address is required` });
    }
    if (!description || !description.trim()) {
        return res.status(400).json({ error: "A bug description is required" });
    }
    if (description.length > 5000) {
        return res.status(400).json({ error: "Description is too long (max 5000 characters)" });
    }

    try {
        await sendBugReportEmail({ reporterEmail: email.trim(), description: description.trim() });
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: "Failed to send bug report", detail: err.message });
    }
});


app.get("/health-check", (req, res) => {
    res.sendStatus(200);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`UBC data server running on http://localhost:${PORT}`));
