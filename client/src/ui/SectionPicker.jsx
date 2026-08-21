import { useEffect } from "react";
import { fmtTime, DAY_LABEL } from "../util/time.js";
import { STATUS_COLORS } from "../util/status.js";
import { COLORS } from "../util/theme.js";
import { X } from "lucide-react";

export default function SectionPicker({ course, selection = {}, onToggle, onSelectAll, onSelectNone, onClose }) {
    const types = Object.keys(course.components).filter(
        (type) => course.components[type].length > 0
    );

    // Let Escape close it too — a free usability win alongside click-outside
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        // This backdrop covers the whole viewport. Its own onClick fires
        // whenever the user clicks anywhere that ISN'T caught by a child
        // element that stops propagation — i.e. anywhere outside the card.
        <div
            onClick={onClose}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 32, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
                padding: "24px",
            }}
        >
            {/* stopPropagation here means clicks inside the card never reach
                the backdrop's onClick, so the modal only closes on an actual
                outside click (or Escape, or the × button) */}
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "600px",
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    overflowY: "auto",
                    background: "#fff",
                    color: "#14202B",
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.ACCENT}`,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                    padding: "24px 26px",
                }}
            >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "4px" }}>
                    <div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontSize: "16px" }}>
                            {course.code}
                        </div>
                        {/* <div style={{ fontSize: "12.5px", color: "#5A6B7A", marginTop: "2px" }}>
                            {course.title}
                        </div> */}
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close section picker"
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: COLORS.TEXT_DARK, lineHeight: 1, padding: "4px" }}
                    >
                        <X size={14} strokeWidth={4} />
                    </button>
                </div>

                <div style={{ fontSize: "12px", color: COLORS.TEXT_MEDIUM, marginBottom: "18px" }}>
                    Uncheck any sections you don't want the scheduler to consider.
                </div>

                {types.map((type) => {
                    const selectedIds = selection[type]; // undefined => everything allowed
                    const options = course.components[type];

                    return (
                        <div key={type} style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", paddingBottom: "6px", borderBottom: `1px solid ${COLORS.ACCENT}` }}>
                                <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#5A6B7A", fontWeight: 600 }}>
                                    {type}
                                </div>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button onClick={() => onSelectAll(type)} style={linkBtnStyle}>All</button>
                                    <button onClick={() => onSelectNone(type)} style={linkBtnStyle}>None</button>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px" }}>
                                {options.map((opt) => {
                                    const checked = !selectedIds || selectedIds.has(opt.label);
                                    const timeLabel =
                                        opt.days.length === 0
                                            ? "Async / online"
                                            : `${opt.days.map((d) => DAY_LABEL[d] ?? d).join(" ")} ${fmtTime(opt.start)}\u2013${fmtTime(opt.end)}`;

                                    return (
                                        <label
                                            key={opt.label}
                                            style={{ display: "flex", alignItems: "center", gap: "9px", fontSize: "13px", padding: "6px 4px", cursor: "pointer", borderRadius: "6px", background: STATUS_COLORS[opt.status] + "1e" }}
                                        >
                                            <input
                                                type="checkbox"
                                                className="cs-checkbox"
                                                checked={checked}
                                                onChange={() => onToggle(type, opt.label)}
                                            />
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flex: "1" }}>
                                                <div style={{ minWidth: 0 }}>
                                                    <div>{opt.label}</div>
                                                    <div style={{ color: STATUS_COLORS[opt.status] + "BF", fontSize: "11.5px" }}>{timeLabel}</div>
                                                </div>
                                                <div style={{ marginRight: "10px" }}>{opt.status}</div>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const linkBtnStyle = {
    background: "none",
    border: "none",
    color: "#1F3A5C",
    fontSize: "11.5px",
    cursor: "pointer",
    textDecoration: "underline",
    padding: 0,
};