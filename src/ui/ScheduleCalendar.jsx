import { DAY_ORDER, DAY_LABEL, DAY_START, DAY_END, PX_PER_MIN, fmtTime } from "../util/time.js";
import { STATUS_COLORS } from "../util/status.js";

// Displays the schedule
// schedule = [{courseCode, type, slot, color}]
export default function ScheduleCalendar({ schedule, settings }) {
    const hours = [];
    for (let m = DAY_START; m <= DAY_END; m += 60) hours.push(m);

    return (
        <div style={{ display: "flex", border: "1px solid #DCE2E7", borderRadius: "10px", overflow: "hidden", background: "#fff" }}>
            {/* Time gutter */}
            <div style={{ width: "56px", flexShrink: 0, borderRight: "1px solid #E5E9EC" }}>
                <div style={{ height: "34px", borderBottom: "1px solid #E5E9EC" }} />
                {hours.map((h) => (
                    <div key={h} style={{ height: `${60 * PX_PER_MIN}px`, fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", color: "#8898A6", textAlign: "right", paddingRight: "8px", position: "relative", top: "-6px" }}>
                        {fmtTime(h)}
                    </div>
                ))}
            </div>

            {/* Day columns */}
            {DAY_ORDER.map((day) => (
                <div key={day} style={{ flex: 1, borderRight: "1px solid #E5E9EC", position: "relative" }}>
                    <div style={{ height: "34px", borderBottom: "1px solid #E5E9EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12.5px", fontWeight: 500, color: "#1F3A5C" }}>
                        {DAY_LABEL[day]}
                    </div>
                    <div style={{ position: "relative", height: `${(DAY_END - DAY_START) * PX_PER_MIN}px` }}>
                        {hours.map((h) => (
                            <div key={h} style={{ position: "absolute", top: `${(h - DAY_START) * PX_PER_MIN}px`, left: 0, right: 0, borderTop: "1px solid #F0F3F5" }} />
                        ))}
                        {/* Beginning and End of day markers (custom time ranges) */}
                        <span style={{
                            position: "absolute",
                            top: `${(settings["startHour"] * 60 - DAY_START) * PX_PER_MIN - 1}px`,
                            height: "1px",
                            left: "0px",
                            right: "0px",
                            background: "#C99A3EAA"
                        }} />
                        <span style={{
                            position: "absolute",
                            top: `${((settings["endHour"]) * 60 - DAY_START) * PX_PER_MIN + 1}px`,
                            height: "1px",
                            left: "0px",
                            right: "0px",
                            background: "#C99A3EAA"
                        }} />
                        {schedule
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
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#FAFAFA", marginTop: "3px", padding: "2px 5px 2px 5px", borderRadius: "10px" }}>
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    background: STATUS_COLORS[entry.slot.status] ?? STATUS_COLORS.Other,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: entry.color, fontSize: "10.5px" }}>
                                                {entry.slot.status}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            ))}
        </div>
    );
}
