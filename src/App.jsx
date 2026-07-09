import React, { useMemo, useState } from "react";

/**
 * ============================================================================
 * COURSE SCHEDULER — beginner-friendly annotated version
 * ============================================================================
 *
 * This file is one "component" — a JavaScript function that returns UI.
 * In React, components are just functions. This one is called
 * `CourseScheduler`, and it's marked `export default` at the bottom so other
 * files can import and render it.
 *
 * High-level structure of this file, top to bottom:
 *   1. Fake data (stand-in for real UBC course/section data)
 *   2. Pure logic functions (no React here — just plain JS: conflict
 *      detection + the backtracking search that finds valid schedules)
 *   3. Small formatting helpers for the calendar grid
 *   4. The React component itself (state + the JSX it renders)
 *
 * Keeping steps 1–3 as plain functions (not tied to React) is deliberate:
 * it means you can test/reuse the scheduling logic completely separately
 * from the UI — which is exactly how I found and fixed the two issues
 * you ran into (see the notes near `generateSchedules` below).
 * ============================================================================
 */

/* ----------------------------------------------------------------------------
 * 1. FAKE SAMPLE DATA
 * ----------------------------------------------------------------------------
 * This stands in for real UBC section data. Each course has a `components`
 * object — the section *types* it requires (LEC = lecture, LAB = lab,
 * TUT = tutorial). A student must pick exactly ONE section from each
 * component type that's present. E.g. CPSC 110 requires one LEC + one LAB;
 * ENGL 112 requires only one LEC.
 *
 * When you swap in real data later, just make sure it matches this same
 * shape (course -> component type -> array of sections with days/start/end)
 * and everything below keeps working unchanged.
 * ------------------------------------------------------------------------- */

// Single-letter day codes, in weekday order. "R" is used for Thursday
// (a scheduling convention) so it doesn't clash with "T" for Tuesday.
const DAY_ORDER = ["M", "T", "W", "R", "F"];
const DAY_LABEL = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

// Converts a "HH:MM" string into "minutes since midnight" (e.g. "09:30" -> 570).
// Storing times as plain numbers (instead of Date objects or strings) makes
// every comparison later on ("does this end before that starts?") a simple
// numeric comparison — no timezone or Date-parsing edge cases to worry about.
function t(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const COURSES = [
  {
    code: "CPSC 110",
    title: "Computation, Programs, and Programming",
    color: "#3D7068", // each course gets one fixed color, used everywhere it appears
    components: {
      LEC: [
        { id: "CPSC110-L01", label: "L01", days: ["M", "W", "F"], start: t("09:00"), end: t("10:00"), instructor: "Reid" },
        { id: "CPSC110-L02", label: "L02", days: ["T", "R"], start: t("11:00"), end: t("12:30"), instructor: "Wolfman" },
      ],
      LAB: [
        { id: "CPSC110-B1A", label: "L1A", days: ["T"], start: t("14:00"), end: t("15:00") },
        { id: "CPSC110-B1B", label: "L1B", days: ["W"], start: t("15:00"), end: t("16:00") },
        { id: "CPSC110-B1C", label: "L1C", days: ["R"], start: t("10:00"), end: t("11:00") },
      ],
    },
  },
  {
    code: "MATH 100",
    title: "Differential Calculus",
    color: "#4A7FA6",
    components: {
      LEC: [
        { id: "MATH100-201", label: "201", days: ["M", "W", "F"], start: t("10:00"), end: t("11:00"), instructor: "Anstee" },
        { id: "MATH100-202", label: "202", days: ["M", "W", "F"], start: t("13:00"), end: t("14:00"), instructor: "Loewen" },
      ],
      TUT: [
        { id: "MATH100-T1A", label: "T1A", days: ["F"], start: t("14:00"), end: t("15:00") },
        { id: "MATH100-T1B", label: "T1B", days: ["M"], start: t("15:00"), end: t("16:00") },
      ],
    },
  },
  {
    code: "ENGL 112",
    title: "Strategies for University Writing",
    color: "#6B5B95",
    components: {
      LEC: [
        { id: "ENGL112-101", label: "101", days: ["T", "R"], start: t("09:30"), end: t("11:00"), instructor: "Pierce" },
        { id: "ENGL112-102", label: "102", days: ["M", "W", "F"], start: t("11:00"), end: t("12:00"), instructor: "Okafor" },
      ],
    },
  },
  {
    code: "PHYS 101",
    title: "Energy and Waves",
    color: "#B5563C",
    components: {
      LEC: [
        { id: "PHYS101-001", label: "001", days: ["M", "W", "F"], start: t("09:00"), end: t("10:00"), instructor: "Hallin" },
        { id: "PHYS101-002", label: "002", days: ["T", "R"], start: t("12:30"), end: t("14:00"), instructor: "Krzywinski" },
      ],
      LAB: [
        { id: "PHYS101-L2A", label: "L2A", days: ["W"], start: t("13:00"), end: t("15:00") },
        { id: "PHYS101-L2B", label: "L2B", days: ["R"], start: t("13:00"), end: t("15:00") },
      ],
    },
  },
  {
    code: "ECON 101",
    title: "Principles of Microeconomics",
    color: "#A67C3D",
    components: {
      LEC: [
        { id: "ECON101-001", label: "001", days: ["M", "W", "F"], start: t("12:00"), end: t("13:00"), instructor: "Kneebone" },
        { id: "ECON101-002", label: "002", days: ["T", "R"], start: t("15:30"), end: t("17:00"), instructor: "Ferede" },
      ],
    },
  },
  {
    // Added specifically so there's a course you can pair with ENGL 112 to see
    // the "no valid combination" state fire for real — see the long comment
    // above `generateSchedules` for why this is here.
    code: "KIN 110",
    title: "Fundamentals of Human Movement",
    color: "#8C4A5B",
    components: {
      // Only one LEC option, and it exactly matches ENGL 112's LEC 102 time.
      LEC: [{ id: "KIN110-001", label: "001", days: ["M", "W", "F"], start: t("11:00"), end: t("12:00") }],
      // Only one TUT option, and it exactly matches ENGL 112's LEC 101 time.
      // So no matter which ENGL 112 section a student picks, KIN 110 collides
      // with it somewhere — there is genuinely no escape.
      TUT: [{ id: "KIN110-T01", label: "T01", days: ["T", "R"], start: t("09:30"), end: t("11:00") }],
    },
  },
];

/* ----------------------------------------------------------------------------
 * 2. CONFLICT-FREE SCHEDULE GENERATION (plain JS — no React)
 * ----------------------------------------------------------------------------
 * NOTE on the bug report: I tested this logic in isolation (outside the UI,
 * with a throwaway script) against every possible combination of the 5
 * original sample courses. Two things came out of that:
 *
 *  (a) The conflict detection itself was correct the whole time. When you
 *      selected CPSC 110 + PHYS 101, both have a LEC at MWF 9–10 that
 *      truly overlaps. The search correctly refused to combine those two —
 *      but it didn't just give up, it kept looking and found that PHYS
 *      101's OTHER lecture section (Tue/Thu 12:30–2:00) has no conflict.
 *      So it quietly used that instead. That's the intended behavior of
 *      "find me *a* working combination," but with no on-screen explanation
 *      it just looks like a section randomly disappeared. I added a note
 *      in the UI below to make this explicit.
 *
 *  (b) The "no valid combination" message never appeared because — with
 *      only the original 5 courses — literally every combination has an
 *      escape route somewhere. There was no bug to see; the empty-state
 *      code was just never actually reachable with that data. I added
 *      KIN 110 above specifically to create a real, verified dead end.
 *      Try selecting ENGL 112 + KIN 110.
 * ------------------------------------------------------------------------- */

// Do two sections' meeting times conflict?
// Two conditions must BOTH be true for a real conflict:
//   1. They share at least one weekday, AND
//   2. Their time ranges overlap on that day.
// `a.start < b.end && b.start < a.end` is the standard "do two ranges
// overlap" check — it correctly treats back-to-back sections (one ending
// exactly when the other starts) as NOT conflicting.
function overlaps(a, b) {
  const sharedDay = a.days.some((d) => b.days.includes(d));
  if (!sharedDay) return false;
  return a.start < b.end && b.start < a.end;
}

// Turns the list of selected course codes into a flat list of "groups" —
// one group per (course, component type) pair. E.g. selecting CPSC 110 +
// MATH 100 produces 4 groups: [CPSC110-LEC, CPSC110-LAB, MATH100-LEC,
// MATH100-TUT]. The search below picks exactly one option from every group.
function buildGroups(selectedCodes) {
  const groups = [];
  for (const code of selectedCodes) {
    const course = COURSES.find((c) => c.code === code);
    for (const [type, options] of Object.entries(course.components)) {
      groups.push({ courseCode: code, type, options, color: course.color });
    }
  }
  return groups;
}

// The core algorithm: BACKTRACKING SEARCH.
// Think of it as trying to fill in the groups one at a time, left to right.
// At each group, try each option in turn; if it doesn't conflict with
// anything picked so far, tentatively keep it and move to the next group.
// If we reach the end, we've found one complete valid schedule — record it.
// Either way, we then "undo" the last pick (`chosen.pop()`) and try the
// next option, so every combination gets a fair shot.
//
// This is far cheaper than generating every possible combination first and
// filtering afterward, because it abandons a bad branch (a conflict) the
// moment it's detected, instead of finishing a doomed combination.
//
// `cap` is a safety limit — with many courses selected, the number of valid
// schedules can grow quickly, and we don't need thousands of near-duplicate
// results just to show the user a handful of good options.
function generateSchedules(selectedCodes, cap = 60) {
  const groups = buildGroups(selectedCodes);
  const results = [];

  function backtrack(i, chosen) {
    if (results.length >= cap) return;

    // Base case: we've successfully picked one option for every group.
    if (i === groups.length) {
      results.push([...chosen]); // copy the array — `chosen` keeps mutating after this
      return;
    }

    const group = groups[i];
    for (const opt of group.options) {
      // Does this option conflict with anything we've already committed to?
      const conflict = chosen.some((c) => overlaps(c.slot, opt));
      if (conflict) continue; // skip this option, try the next one

      chosen.push({ courseCode: group.courseCode, type: group.type, slot: opt, color: group.color });
      backtrack(i + 1, chosen); // recurse into the next group
      chosen.pop(); // undo, so the next loop iteration starts clean

      if (results.length >= cap) return;
    }
    // If every option in this group conflicted, this function simply returns
    // without ever pushing to `results` — which is exactly how a genuine
    // "no valid schedule" result happens (see KIN 110 above).
  }

  backtrack(0, []);
  return results;
}

/* ----------------------------------------------------------------------------
 * 3. CALENDAR RENDERING HELPERS
 * ----------------------------------------------------------------------------
 * The calendar draws events using absolute pixel positioning: each event's
 * vertical position and height are calculated from its start/end time in
 * minutes. PX_PER_MIN controls how "tall" an hour looks on screen.
 * ------------------------------------------------------------------------- */

const DAY_START = t("08:00"); // calendar's visible window starts at 8am
const DAY_END = t("18:00"); // ...and ends at 6pm
const PX_PER_MIN = 1.1; // 1.1 pixels per minute => a 1-hour block is 66px tall

// Converts "930" (minutes) into a human time label like "9:30am".
function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12; // convert 24h -> 12h, with 0 -> 12
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

/* ----------------------------------------------------------------------------
 * 4. THE REACT COMPONENT
 * ----------------------------------------------------------------------------
 * Everything above was plain JavaScript. This is where React comes in.
 *
 * A React component is a function that:
 *   - holds some STATE (data that can change over time, e.g. which courses
 *     are checked)
 *   - returns JSX (HTML-like syntax) describing what should be on screen
 *     *for the current state*
 *
 * React's whole job is: whenever state changes, automatically re-run this
 * function and update the real screen to match whatever JSX comes back.
 * You never manually reach into the DOM and change things — you just
 * describe "given this state, here's what it should look like," and
 * update the state when something happens (a click, a checkbox toggle).
 * ------------------------------------------------------------------------- */

export default function CourseScheduler() {
  // ---- STATE ----------------------------------------------------------
  // `useState` is a React "hook" — a special function that gives a
  // component memory. It returns a pair: [currentValue, functionToUpdateIt].
  // Calling the update function tells React "state changed, please re-render."

  // Which course codes are currently checked, stored as a Set (a
  // collection with no duplicates — good fit for "is X in the selection?").
  // Pre-checking 3 courses just gives the page something to look at on load.
  const [selected, setSelected] = useState(new Set(["CPSC 110", "MATH 100", "ENGL 112"]));

  // Which generated schedule (0, 1, 2, ...) is currently being viewed.
  const [index, setIndex] = useState(0);

  // Three possible values: null (never generated yet), or `true` (the user
  // clicked "Generate" for the current selection). This exists separately
  // from `selected` so we can distinguish "haven't generated yet" from
  // "generated, and it came back empty" — those need different messages.
  const [generated, setGenerated] = useState(null);

  // ---- EVENT HANDLERS ---------------------------------------------------
  // A handler is just a regular function that calls the `setX` functions
  // above in response to something the user does.

  const toggleCourse = (code) => {
    // Any time the selection changes, the previously generated schedules
    // are stale, so we clear them and require an explicit re-generate.
    setGenerated(null);
    setIndex(0);
    setSelected((prev) => {
      // IMPORTANT REACT RULE: never mutate state directly (e.g. prev.add(...)
      // then return prev). React detects changes by checking whether the
      // value is a *new* object, so we copy the old Set into a new one,
      // modify the copy, and return that.
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  // ---- DERIVED DATA -------------------------------------------------------
  // `useMemo` recomputes a value only when its dependencies (the array at
  // the end) actually change — otherwise it reuses the previous result.
  // Here, `generateSchedules` only needs to re-run when `generated` flips
  // to true or the selection changes, not on every single re-render.
  const schedules = useMemo(() => {
    if (!generated) return [];
    return generateSchedules([...selected]); // Set -> array, since our functions expect arrays
  }, [generated, selected]);

  const current = schedules[index]; // the specific schedule currently on screen

  // Build the list of hour marks (8am, 9am, ... 6pm) for the calendar's
  // left-hand time gutter. This is plain JS running during render — it's
  // cheap enough not to need useMemo.
  const hours = [];
  for (let m = DAY_START; m <= DAY_END; m += 60) hours.push(m);

  // ---- RENDER (JSX) -------------------------------------------------------
  // Below this point is JSX: it looks like HTML, but it's actually
  // JavaScript. `{ }` lets you drop back into plain JS expressions inside
  // markup (e.g. `{schedules.length}` prints a number; `{cond && <div/>}`
  // conditionally renders a chunk of UI only when `cond` is truthy).
  //
  // Styling note: this component uses inline `style={{...}}` objects rather
  // than a CSS file. For a small self-contained component like this, it
  // keeps everything colocated and avoids class-name clashes — the
  // trade-off is more visual noise in the JSX, which is why the design
  // decisions are explained separately below rather than re-explained at
  // every style object.
  return (
    <div style={{
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#F4F6F8",
      minHeight: "600px",
      color: "#14202B",
      display: "flex",
      borderRadius: "14px",
      overflow: "hidden",
      border: "1px solid #DCE2E7",
    }}>
      {/* A plain <style> tag for things inline styles can't express well:
          hover states, @import for web fonts, and the `:disabled` pseudo-class. */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .cs-checkbox { accent-color: #1F3A5C; width: 15px; height: 15px; cursor: pointer; }
        .cs-course-row { transition: background 0.15s ease; }
        .cs-course-row:hover { background: #EEF1F4; }
        .cs-btn { transition: opacity 0.15s ease, transform 0.1s ease; }
        .cs-btn:hover { opacity: 0.88; }
        .cs-btn:active { transform: scale(0.98); }
        .cs-nav-btn:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>

      {/* ---------------- Sidebar: course picker ---------------- */}
      <div style={{ width: "270px", background: "#1F3A5C", color: "#EDF1F5", padding: "24px 20px", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, letterSpacing: "0.2px" }}>
          Schedule Builder
        </div>
        <div style={{ fontSize: "12.5px", color: "#9FB3C8", marginTop: "4px", marginBottom: "22px" }}>
          Sample data &middot; not live UBC sections
        </div>

        <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9FB3C8", marginBottom: "8px" }}>
          Desired courses
        </div>

        <div>
          {/* .map() turns each course object into a piece of JSX. React needs
              a unique `key` on each item in a list so it can efficiently
              track which item is which across re-renders — course `code`
              works well here since it's already unique. */}
          {COURSES.map((c) => (
            <label
              key={c.code}
              className="cs-course-row"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "9px 8px",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "2px",
              }}
            >
              {/* This is a "controlled" checkbox: its checked state comes
                  entirely from React state (`selected`), not from the browser's
                  own internal checkbox memory. `onChange` fires on click and
                  tells our state to update, which then feeds back into
                  `checked` — a one-way loop that keeps the UI and state in sync. */}
              <input
                type="checkbox"
                className="cs-checkbox"
                checked={selected.has(c.code)}
                onChange={() => toggleCourse(c.code)}
                style={{ marginTop: "2px" }}
              />
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                  <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: c.color, display: "inline-block", flexShrink: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 500 }}>{c.code}</span>
                </div>
                <div style={{ fontSize: "12px", color: "#B9C8D6", marginTop: "2px", lineHeight: 1.3 }}>{c.title}</div>
              </div>
            </label>
          ))}
        </div>

        <button
          className="cs-btn"
          onClick={() => { setGenerated(true); setIndex(0); }}
          disabled={selected.size === 0}
          style={{
            marginTop: "22px",
            width: "100%",
            background: selected.size === 0 ? "#3E5872" : "#C99A3E",
            color: selected.size === 0 ? "#9FB3C8" : "#1F2A16",
            border: "none",
            borderRadius: "8px",
            padding: "11px",
            fontWeight: 600,
            fontSize: "13.5px",
            cursor: selected.size === 0 ? "not-allowed" : "pointer",
          }}
        >
          Generate schedules
        </button>
      </div>

      {/* ---------------- Main panel ---------------- */}
      <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
        {/* Three mutually-exclusive states, each guarded by a condition:
            1. Nothing generated yet
            2. Generated, but zero valid schedules exist
            3. Generated, and at least one valid schedule exists
            `condition && <jsx/>` is a common React pattern: if `condition`
            is false, React renders nothing at all for that expression. */}

        {!generated && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", height: "100%", color: "#5A6B7A" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "22px", color: "#1F3A5C", marginBottom: "8px" }}>
              Pick your courses, then generate
            </div>
            <div style={{ fontSize: "14px", maxWidth: "420px", lineHeight: 1.6 }}>
              Select the courses you want on the left. The engine will search every combination of
              lecture, lab, and tutorial sections and show you only the ones with zero time conflicts.
            </div>
          </div>
        )}

        {generated && schedules.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", color: "#B5563C", marginBottom: "8px" }}>
              No conflict-free combination exists
            </div>
            <div style={{ fontSize: "14px", color: "#5A6B7A", maxWidth: "420px", lineHeight: 1.6 }}>
              Every section pairing for these courses overlaps somewhere. Try removing a course or
              swapping one out to see if a valid schedule opens up.
            </div>
          </div>
        )}

        {generated && schedules.length > 0 && (
          // A React "fragment" (<>...</>) groups multiple elements without
          // adding an extra wrapper <div> to the actual page markup.
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", color: "#1F3A5C" }}>
                {schedules.length} valid schedule{schedules.length > 1 ? "s" : ""} found
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  className="cs-nav-btn"
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={index === 0}
                  style={navBtnStyle}
                >
                  ←
                </button>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#5A6B7A", minWidth: "70px", textAlign: "center" }}>
                  {index + 1} of {schedules.length}
                </span>
                <button
                  className="cs-nav-btn"
                  onClick={() => setIndex((i) => Math.min(schedules.length - 1, i + 1))}
                  disabled={index === schedules.length - 1}
                  style={navBtnStyle}
                >
                  →
                </button>
              </div>
            </div>

            {/* This line exists specifically to answer "why did one course's
                section change on its own?" — see the note near
                `generateSchedules` above. Without it, the section-swapping
                behavior looks like a bug rather than a feature. */}
            <div style={{ fontSize: "12.5px", color: "#5A6B7A", marginBottom: "14px" }}>
              Sections are chosen automatically to avoid conflicts — if two of your courses only
              overlap in one section, the engine may use a different section than you expected.
            </div>

            {/* ---------------- Calendar grid ---------------- */}
            <div style={{ display: "flex", border: "1px solid #DCE2E7", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
              {/* Time gutter (the column of hour labels on the left) */}
              <div style={{ width: "56px", flexShrink: 0, borderRight: "1px solid #E5E9EC" }}>
                <div style={{ height: "34px", borderBottom: "1px solid #E5E9EC" }} />
                {hours.map((h) => (
                  <div key={h} style={{ height: `${60 * PX_PER_MIN}px`, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8898A6", textAlign: "right", paddingRight: "8px", position: "relative", top: "-6px" }}>
                    {fmtTime(h)}
                  </div>
                ))}
              </div>

              {/* One column per weekday */}
              {DAY_ORDER.map((day) => (
                <div key={day} style={{ flex: 1, borderRight: "1px solid #E5E9EC", position: "relative" }}>
                  <div style={{ height: "34px", borderBottom: "1px solid #E5E9EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: 500, color: "#1F3A5C" }}>
                    {DAY_LABEL[day]}
                  </div>
                  {/* This inner div is `position: relative`, which makes it the
                      anchor for the `position: absolute` event blocks inside it —
                      each block's `top` is measured from this container's top edge. */}
                  <div style={{ position: "relative", height: `${(DAY_END - DAY_START) * PX_PER_MIN}px` }}>
                    {/* faint hour gridlines */}
                    {hours.slice(0, -1).map((h) => (
                      <div key={h} style={{ position: "absolute", top: `${(h - DAY_START) * PX_PER_MIN}px`, left: 0, right: 0, borderTop: "1px solid #F0F3F5" }} />
                    ))}

                    {/* Only render the entries (course sections) that meet on
                        THIS particular day. `current` is the one schedule the
                        user is currently looking at — an array of
                        { courseCode, type, slot, color } objects. */}
                    {current
                      .filter((entry) => entry.slot.days.includes(day))
                      .map((entry, i) => {
                        // Convert this section's start/end time (in minutes)
                        // into a pixel position within the day column.
                        const top = (entry.slot.start - DAY_START) * PX_PER_MIN;
                        const height = (entry.slot.end - entry.slot.start) * PX_PER_MIN;
                        return (
                          <div
                            key={i}
                            title={`${entry.courseCode} ${entry.type} ${entry.slot.label}`}
                            style={{
                              position: "absolute",
                              top: `${top}px`,
                              height: `${height - 2}px`, // -2px leaves a hairline gap between back-to-back blocks
                              left: "3px",
                              right: "3px",
                              background: entry.color + "1E", // appends alpha (hex "1E" ≈ 12% opacity) to the course's color
                              borderLeft: `3px solid ${entry.color}`,
                              borderRadius: "5px",
                              padding: "4px 6px",
                              fontSize: "11px",
                              overflow: "hidden",
                              color: "#1F2A16",
                            }}
                          >
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: entry.color, fontSize: "10.5px" }}>
                              {entry.courseCode}
                            </div>
                            <div style={{ color: "#4A5764", fontSize: "10.5px" }}>{entry.type} {entry.slot.label}</div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Pulled out as a standalone object since the exact same style is reused by
// both the "←" and "→" buttons — avoids repeating the same object twice.
const navBtnStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "6px",
  border: "1px solid #DCE2E7",
  background: "#fff",
  color: "#1F3A5C",
  fontSize: "14px",
  cursor: "pointer",
};
