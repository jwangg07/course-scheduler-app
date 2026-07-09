export default function ScheduleNav({ index, total, onPrev, onNext }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <button className="cs-nav-btn" onClick={onPrev} disabled={index === 0} style={navBtnStyle}>
        ←
      </button>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#5A6B7A", minWidth: "70px", textAlign: "center" }}>
        {index + 1} of {total}
      </span>
      <button className="cs-nav-btn" onClick={onNext} disabled={index === total - 1} style={navBtnStyle}>
        →
      </button>
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
