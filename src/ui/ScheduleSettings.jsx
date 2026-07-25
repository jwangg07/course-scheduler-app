import { DAY_START, DAY_END, fmtTime } from "../util/time.js";

// Hour options between the calendar's visible window
const HOUR_OPTIONS = [];
for (let h = DAY_START / 60; h <= DAY_END / 60; h++) HOUR_OPTIONS.push(h);

export const DEFAULT_SETTINGS = {
    startHour: DAY_START / 60,
    endHour: DAY_END / 60,
};

// narrow down how many schedules get generated.
export default function ScheduleSettings({ settings, onSettingsChange }) {
    const handleStartChange = (e) => {
        const startHour = Number(e.target.value);
        onSettingsChange((prev) => ({
            ...prev,
            startHour,
            endHour: Math.max(prev.endHour, startHour + 1),
        }));
    };

    const handleEndChange = (e) => {
        const endHour = Number(e.target.value);
        onSettingsChange((prev) => ({
            ...prev,
            endHour,
            startHour: Math.min(prev.startHour, endHour - 1),
        }));
    };

    return (
        <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #3E5872" }}>
            <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9FB3C8", marginBottom: "10px" }}>
                Settings
            </div>

            <div style={{ fontSize: "12.5px", color: "#EDF1F5", marginBottom: "6px" }}>
                Only include classes that start after and end before:
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <select
                    className="cs-select"
                    value={settings.startHour}
                    onChange={handleStartChange}
                    style={selectStyle}
                >
                    {HOUR_OPTIONS.filter((h) => h < settings.endHour).map((h) => (
                        <option key={h} value={h}>{fmtTime(h * 60)}</option>
                    ))}
                </select>
                <span style={{ color: "#7D93A8", fontSize: "12px" }}>to</span>
                <select
                    className="cs-select"
                    value={settings.endHour}
                    onChange={handleEndChange}
                    style={selectStyle}
                >
                    {HOUR_OPTIONS.filter((h) => h > settings.startHour).map((h) => (
                        <option key={h} value={h}>{fmtTime(h * 60)}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}

const selectStyle = {
    flex: 1,
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #3E5872",
    background: "#26466B",
    color: "#EDF1F5",
    fontSize: "13px",
};