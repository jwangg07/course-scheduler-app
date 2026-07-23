import express from "express";
import cors from "cors";
import { getCourseSections, getAvailableTerms } from "./lib/ubcClient.js";

const app = express();

app.use(cors({
    origin: ['https://vercel.app', 'http://localhost:5173'],
    credentials: true
}));

// GET /api/terms  ->  { terms: [{ id, name, start, end }, ...] }
// dropdown in the React app fetch to populate options.
app.get("/api/terms", async (req, res) => {
    try {
        const terms = await getAvailableTerms();
        res.json({ terms });
    } catch (err) {
        console.error(err);
        res.status(502).json({ error: "Failed to fetch terms", detail: err.message });
    }
});

// GET /api/sections/CPSC/110              -> sections for the current term
// GET /api/sections/CPSC/110?term=1454    -> sections for a specific term
// getCourseSections falls back to whichever term covers today.
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

const PORT = 3001;
app.listen(PORT, () => console.log(`UBC data server running on http://localhost:${PORT}`));
