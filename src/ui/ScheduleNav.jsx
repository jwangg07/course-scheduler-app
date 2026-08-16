import { COLORS } from "../util/theme";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Move between prev / next schedules to be displayed
export default function ScheduleNav({ index, total, onPrev, onNext }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button className="cs-nav-btn" onClick={onPrev} disabled={index === 0} style={navBtnStyle}>
                <ArrowLeft size={12} height={24}/>
            </button>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: "#5A6B7A", minWidth: "70px", textAlign: "center" }}>
                {index + 1} of {total}
            </span>
            <button className="cs-nav-btn" onClick={onNext} disabled={index === total - 1} style={navBtnStyle}>
                <ArrowRight size={12} height={24}/>
            </button>
        </div>
    );
}

const navBtnStyle = {
    width: "28px",
    height: "28px",
    borderRadius: "6px",
    border: `1px solid ${COLORS.ACCENT}`,
    background: "#fff",
    color: COLORS.TEXT_DARK,
    fontSize: "14px",
    cursor: "pointer",
};
