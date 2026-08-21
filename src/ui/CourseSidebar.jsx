import { useState } from "react";
import ScheduleSettings from "./ScheduleSettings.jsx";
import SectionPicker from "./SectionPicker.jsx";
import { COLORS } from "./../util/theme.js";
import { X, ArrowRight, Settings } from "lucide-react";

export default function CourseSidebar({
    campus,
    onCampusChange,
    terms,
    onTermChange,
    courses,
    onAddCourse,
    onRemoveCourse,
    addStatus,
    onGenerate,
    settings,
    onSettingsChange,
    sectionSelections,
    onToggleSection,
    onSelectAllSections,
    onSelectNoSections,
}) {
    const [dept, setDept] = useState("");
    const [courseNumber, setCourseNumber] = useState("");
    const [term, setTerm] = useState("");
    const [termError, setTermError] = useState(null);

    // Which course's section-picker popover is currently open (by code), or null
    const [openPickerFor, setOpenPickerFor] = useState(null);

    const handleAdd = (e) => {
        e.preventDefault();
        if (!term) {
            setTermError("Please select a term before adding a course.");
            return;
        }
        setTermError(null);
        if (!dept.trim() || !courseNumber.trim()) return;
        onAddCourse(dept.trim().toUpperCase(), courseNumber.trim());
        setDept("");
        setCourseNumber("");
    };

    const changeTerm = (termName) => {
        campus === "Vancouver" ? termName = `${termName} (UBC-V)` : termName = `${termName} (UBC-O)`;
        onTermChange(termName);
    }

    return (
        <div style={{ width: "450px", background: COLORS.PRIMARY, color: COLORS.TEXT_LIGHT, padding: "24px 20px", flexShrink: 0 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "20px", fontWeight: 600, letterSpacing: "0.2px" }}>
                Schedule Builder
            </div>
            <div style={{ fontSize: "12.5px", color: COLORS.TEXT_MEDIUM, marginTop: "4px", marginBottom: "20px" }}>
                Live UBC section data
            </div>

            {/* Campus Picker */}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.TEXT_MEDIUM, marginBottom: "6px" }}>
                Campus
            </div>
            <select
                className="cs-select"
                value={campus}
                onChange={(e) => onCampusChange(e.target.value)}
                style={{ width: "100%", marginBottom: "20px", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${COLORS.PRIMARY_DARK_ACCENT}`, background: COLORS.PRIMARY_DARK, color: COLORS.TEXT_LIGHT, fontSize: "13px" }}
            >
                <option>Vancouver</option>
                <option>Okanagan</option>
            </select>

            {/* Term Picker*/}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.TEXT_MEDIUM, marginBottom: "6px" }}>
                Term
            </div>
            <select
                className="cs-select"
                value={term ?? ""}
                onChange={(e) => {
                    setTerm(e.target.value);
                    setTermError(null); // clear any "please select a term" error once they pick one
                    changeTerm(e.target.value);
                }}
                style={{
                    width: "100%",
                    marginBottom: "20px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    border: `1px solid ${COLORS.PRIMARY_DARK_ACCENT}`,
                    background: COLORS.PRIMARY_DARK,
                    color: term ? COLORS.TEXT_LIGHT : COLORS.TEXT_MEDIUM,
                    fontSize: "13px",
                }}
            >
                <option value="" disabled>Select a term</option>
                {terms.map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>

            {/* --- Add-course form --- */}
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: COLORS.TEXT_MEDIUM, marginBottom: "6px" }}>
                Add a course
            </div>
            <form onSubmit={handleAdd} style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                <input
                    value={dept}
                    onChange={(e) => setDept(e.target.value)}
                    placeholder="CPSC"
                    style={{ width: "70px", padding: "8px 10px", borderRadius: "8px", border: `1px solid ${COLORS.PRIMARY_DARK_ACCENT}`, background: COLORS.PRIMARY_DARK, color: COLORS.TEXT_LIGHT, fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <input
                    value={courseNumber}
                    onChange={(e) => setCourseNumber(e.target.value)}
                    placeholder="110"
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "8px", border: `1px solid ${COLORS.PRIMARY_DARK_ACCENT}`, background: COLORS.PRIMARY_DARK, color: COLORS.TEXT_LIGHT, fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" }}
                />
                <button
                    type="submit"
                    className="cs-btn"
                    disabled={addStatus.loading}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "none", background: COLORS.SECONDARY, color: COLORS.TEXT_DARK, fontWeight: 600, fontSize: "13px", cursor: addStatus.loading ? "wait" : "pointer" }}
                >
                    {addStatus.loading ? "…" : "Add"}
                </button>
            </form>
            {(termError || addStatus.error) && (
                <div style={{ fontSize: "12px", color: COLORS.ERROR, marginBottom: "10px", lineHeight: 1.4 }}>
                    {termError || addStatus.error}
                </div>
            )}

            {/* --- Added courses list --- */}
            <div style={{ marginBottom: "16px" }}>
                {courses.length === 0 && (
                    <div style={{ fontSize: "12.5px", color: COLORS.TEXT_MEDIUM, padding: "8px 0" }}>
                        No courses added yet.
                    </div>
                )}
                {courses.map((c) => (
                    <div
                        key={c.code}
                        className="cs-course-row"
                        onClick={() => setOpenPickerFor(c.code)}
                        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 8px", borderRadius: "8px", marginBottom: "2px" }}
                    >
                        {/* Fades out on hover so "Select sections" can fade in over it */}
                        <div className="cs-course-info" style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                            <span style={{ width: "9px", height: "9px", borderRadius: "3px", background: c.color, display: "inline-block", flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", fontWeight: 500 }}>{c.code}</div>
                                {/* <div style={{ fontSize: "11.5px", color: COLORS.PRIMARY_LIGHT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div> */}
                            </div>
                        </div>

                        {/* Hidden until hover; see the .cs-select-hint rule in index.css */}
                        <div className="cs-select-hint" style={{ color: COLORS.TEXT_DARK, fontWeight: 600 }}>SELECT SECTIONS</div>

                        <button
                            onClick={(e) => {
                                // Stop the click from bubbling up to the row's
                                // onClick — otherwise removing a course would
                                // ALSO open the section picker for it
                                e.stopPropagation();
                                onRemoveCourse(c.code);
                            }}
                            aria-label={`Remove ${c.code}`}
                            style={{ background: "none", border: "none", color: COLORS.TEXT_LIGHT, cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "4px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <Settings className="course-settings-button" size={12} strokeWidth={3} />
                            <X className="course-remove-button" size={12} strokeWidth={3} />
                        </button>
                    </div>
                ))}
            </div>

            {openPickerFor && (
                <SectionPicker
                    course={courses.find((c) => c.code === openPickerFor)}
                    selection={sectionSelections[openPickerFor] ?? {}}
                    onToggle={(type, sectionId) => onToggleSection(openPickerFor, type, sectionId)}
                    onSelectAll={(type) => onSelectAllSections(openPickerFor, type)}
                    onSelectNone={(type) => onSelectNoSections(openPickerFor, type)}
                    onClose={() => setOpenPickerFor(null)}
                />
            )}

            <button
                className="cs-btn"
                onClick={onGenerate}
                disabled={courses.length === 0}
                style={{
                    width: "100%",
                    background: courses.length === 0 ? COLORS.PRIMARY_DARK : COLORS.SECONDARY,
                    color: courses.length === 0 ? COLORS.TEXT_LIGHT : COLORS.TEXT_DARK,
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
