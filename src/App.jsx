import React, { useMemo, useState } from "react";

const DAY_ORDER = ["M", "T", "W", "R", "F"];
const DAY_LABEL = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

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
    code: "KIN 110",
    title: "Fundamentals of Human Movement",
    color: "#8C4A5B",
    components: {
      LEC: [{ id: "KIN110-001", label: "001", days: ["M", "W", "F"], start: t("11:00"), end: t("12:00") }],
      TUT: [{ id: "KIN110-T01", label: "T01", days: ["T", "R"], start: t("09:30"), end: t("11:00") }],
    },
  },
];


function overlaps(a, b) {
  const sharedDay = a.days.some((d) => b.days.includes(d));
  if (!sharedDay) return false;
  return a.start < b.end && b.start < a.end;
}

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

function generateSchedules(selectedCodes, cap = 60) {
  const groups = buildGroups(selectedCodes);
  const results = [];

  function backtrack(i, chosen) {
    if (results.length >= cap) return;

    if (i === groups.length) {
      results.push([...chosen]);
      return;
    }

    const group = groups[i];
    for (const opt of group.options) {
      const conflict = chosen.some((c) => overlaps(c.slot, opt));
      if (conflict) continue; 

      chosen.push({ courseCode: group.courseCode, type: group.type, slot: opt, color: group.color });
      backtrack(i + 1, chosen); 
      chosen.pop();

      if (results.length >= cap) return;
    }
  }

  backtrack(0, []);
  return results;
}


const DAY_START = t("08:00"); 
const DAY_END = t("18:00"); 
const PX_PER_MIN = 1.1; 

function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12; // convert 24h -> 12h, with 0 -> 12
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

export default function CourseScheduler() {
  const [selected, setSelected] = useState(new Set(["CPSC 110", "MATH 100", "ENGL 112"]));

  const [index, setIndex] = useState(0);

  const [generated, setGenerated] = useState(null);

  const toggleCourse = (code) => {
    setGenerated(null);
    setIndex(0);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const schedules = useMemo(() => {
    if (!generated) return [];
    return generateSchedules([...selected]); 
  }, [generated, selected]);

  const current = schedules[index]; 

  const hours = [];
  for (let m = DAY_START; m <= DAY_END; m += 60) hours.push(m);

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
      {}
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
          {}
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
                  <div style={{ position: "relative", height: `${(DAY_END - DAY_START) * PX_PER_MIN}px` }}>
                    {/* faint hour gridlines */}
                    {hours.slice(0, -1).map((h) => (
                      <div key={h} style={{ position: "absolute", top: `${(h - DAY_START) * PX_PER_MIN}px`, left: 0, right: 0, borderTop: "1px solid #F0F3F5" }} />
                    ))}
                    {current
                      .filter((entry) => entry.slot.days.includes(day))
                      .map((entry, i) => {
                        const top = (entry.slot.start - DAY_START) * PX_PER_MIN;
                        const height = (entry.slot.end - entry.slot.start) * PX_PER_MIN;
                        return (
                          <div
                            key={i}
                            title={`${entry.courseCode} ${entry.type} ${entry.slot.label}`}
                            style={{
                              position: "absolute",
                              top: `${top}px`,
                              height: `${height - 2}px`, 
                              left: "3px",
                              right: "3px",
                              background: entry.color + "1E", 
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
