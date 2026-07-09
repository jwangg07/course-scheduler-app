export default function CourseSidebar({ courses, selected, onToggle, onGenerate }) {
  return (
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
        {courses.map((c) => (
          <label
            key={c.code}
            className="cs-course-row"
            style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "9px 8px", borderRadius: "8px", cursor: "pointer", marginBottom: "2px" }}
          >
            <input
              type="checkbox"
              className="cs-checkbox"
              checked={selected.has(c.code)}
              onChange={() => onToggle(c.code)}
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
        onClick={onGenerate}
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
  );
}
