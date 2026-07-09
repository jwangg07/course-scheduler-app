import { DAY_ORDER, DAY_LABEL, DAY_START, DAY_END, PX_PER_MIN, fmtTime } from "../util/time.js";

export default function ScheduleCalendar({ schedule }) {
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
            {hours.slice(0, -1).map((h) => (
              <div key={h} style={{ position: "absolute", top: `${(h - DAY_START) * PX_PER_MIN}px`, left: 0, right: 0, borderTop: "1px solid #F0F3F5" }} />
            ))}

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
                  </div>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
