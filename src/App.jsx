import { useMemo, useState } from "react";
import { COURSES } from "./data/courses.js";
import { generateSchedules } from "./util/scheduler.js";
import CourseSidebar from "./ui/CourseSidebar.jsx";
import ScheduleCalendar from "./ui/ScheduleCalendar.jsx";
import ScheduleNav from "./ui/ScheduleNav.jsx";
import EmptyState from "./ui/EmptyState.jsx";

export default function App() {
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
    return generateSchedules([...selected], COURSES);
  }, [generated, selected]);

  const current = schedules[index];

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
      <CourseSidebar
        courses={COURSES}
        selected={selected}
        onToggle={toggleCourse}
        onGenerate={() => { setGenerated(true); setIndex(0); }}
      />

      <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
        {!generated && (
          <EmptyState
            title="Pick your courses, then generate"
            message="Select the courses you want on the left. The engine will search every combination of lecture, lab, and tutorial sections and show you only the ones with zero time conflicts."
          />
        )}

        {generated && schedules.length === 0 && (
          <EmptyState
            tone="error"
            title="No conflict-free combination exists"
            message="Every section pairing for these courses overlaps somewhere. Try removing a course or swapping one out to see if a valid schedule opens up."
          />
        )}

        {generated && schedules.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", color: "#1F3A5C" }}>
                {schedules.length} valid schedule{schedules.length > 1 ? "s" : ""} found
              </div>
              <ScheduleNav
                index={index}
                total={schedules.length}
                onPrev={() => setIndex((i) => Math.max(0, i - 1))}
                onNext={() => setIndex((i) => Math.min(schedules.length - 1, i + 1))}
              />
            </div>

            <div style={{ fontSize: "12.5px", color: "#5A6B7A", marginBottom: "14px" }}>
              Sections are chosen automatically to avoid conflicts — if two of your courses only
              overlap in one section, the engine may use a different section than you expected.
            </div>

            <ScheduleCalendar schedule={current} />
          </>
        )}
      </div>
    </div>
  );
}
