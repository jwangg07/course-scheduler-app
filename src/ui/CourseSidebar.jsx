import { useState } from "react";
import ScheduleSettings from "./ScheduleSettings.jsx"

export default function CourseSidebar({
    campus,
    onCampusChange,
    terms,
    selectedTermId,
    onTermChange,
    courses,
    onAddCourse,
    onRemoveCourse,
    addStatus,
    onGenerate,
    settings,
    onSettingsChange,
}) {
    const [dept, setDept] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [term, setTerm] = useState("");

    const handleAdd = (e) => {
        e.preventDefault(); // stop the browser's default "reload the page" form behavior
        if (!dept.trim() || !courseNumber.trim()) return;
        onAddCourse(dept.trim().toUpperCase(), courseNumber.trim());
        setDept("");
        setCourseNumber("");
    };

    return (
        <div style={{ width: "450px", background: "#1F3A5C", color: "#EDF1F5", padding: "24px 20px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, letterSpacing: "0.2px" }}>
                Schedule Builder
            </div>
            <div style={{ fontSize: "12.5px", color: "#9FB3C8", marginTop: "4px", marginBottom: "20px" }}>
                Live UBC section data
            </div>

            {/* Campus Picker */}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9FB3C8", marginBottom: "6px" }}>
                Campus
            </div>
            <select
                className="cs-select"
                value={campus}
                onChange={(e) => onCampusChange(e.target.value)}
                style={{ width: "100%", marginBottom: "20px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #3E5872", background: "#26466B", color: "#EDF1F5", fontSize: "13px" }}
            >
                <option>Vancouver</option>
                <option>Okanagan</option>
            </select>

            {/* Term Picker*/}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9FB3C8", marginBottom: "6px" }}>
                Term
            </div>
            <select
                className="cs-select"
                value={term ?? ""}
                onChange={(e) => {
                    setTerm(e.target.value);
                    onTermChange(e.target.value)}
                } 
                style={{ width: "100%", marginBottom: "20px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #3E5872", background: "#26466B", color: "#EDF1F5", fontSize: "13px" }}
            >
                {terms.map((t) => (
                    <option key={t} value={t}>{t}</option> 
                ))}
            </select>

            {/* --- Add-course form --- */}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9FB3C8", marginBottom: "6px" }}>
                Add a course
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                <input
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    placeholder="CPSC"
                    style={{ width: "70px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #3E5872", background: "#26466B", color: "#EDF1F5", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <input
                    value={courseNumber}
                    onChange={(e) => setCourseNumber(e.target.value)}
                    placeholder="110"
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: "1px solid #3E5872", background: "#26466B", color: "#EDF1F5", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <button
                    type="submit"
                    className="cs-btn"
                    disabled={addStatus.loading}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: "#C99A3E", color: "#1F2A16", fontWeight: 600, fontSize: "13px", cursor: addStatus.loading ? "wait" : "pointer" }}
                >
                    {addStatus.loading ? "…" : "Add"}
                </button>
            </form>
            {addStatus.error && (
                <div style={{ fontSize: "12px", color: "#E8A398", marginBottom: "10px", lineHeight: 1.4 }}>
                    {addStatus.error}
                </div>
            )}

            {/* --- Added courses list --- */}
            <div style={{ marginBottom: "16px" }}>
                {courses.length === 0 && (
                    <div style={{ fontSize: "12.5px", color: "#7D93A8", padding: "8px 0" }}>
                        No courses added yet.
                    </div>
                )}
                {courses.map((c) => (
                    <div
                        key={c.code}
                        className="cs-course-row"
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px", borderRadius: "8px", marginBottom: "2px" }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                            <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: c.color, display: "inline-block", flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 500 }}>{c.code}</div>
                                <div style={{ fontSize: "11.5px", color: "#B9C8D6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => onRemoveCourse(c.code)}
                            aria-label={`Remove ${c.code}`}
                            style={{ background: "none", border: "none", color: "#9FB3C8", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px" }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>

            <button
                className="cs-btn"
                onClick={onGenerate}
                disabled={courses.length === 0}
                style={{
                    width: "100%",
                    background: courses.length === 0 ? "#3E5872" : "#C99A3E",
                    color: courses.length === 0 ? "#9FB3C8" : "#1F2A16",
                    border: "none",
                    borderRadius: "8px",
                    padding: "11px",
                    fontWeight: 600,
                    fontSize: "13.5px",
                    cursor: courses.length === 0 ? "not-allowed" : "pointer",
                }}
            >
                Generate schedules
            </button>

            <ScheduleSettings settings={settings} onSettingsChange={onSettingsChange} />
        </div>
    );
}
