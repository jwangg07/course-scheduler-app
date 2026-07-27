import { useEffect, useMemo, useState } from "react";
import { generateSchedules } from "./util/scheduler.js";
import { fetchTerms, fetchCourse } from "./api/ubcApi.js";
import CourseSidebar from "./ui/CourseSidebar.jsx";
import ScheduleCalendar from "./ui/ScheduleCalendar.jsx";
import ScheduleNav from "./ui/ScheduleNav.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import { DEFAULT_SETTINGS } from "./ui/ScheduleSettings.jsx";

export default function App() {
    // Campus
    const [campus, setCampus] = useState("Vancouver");

    // Terms (loaded once)
    const [terms, setTerms] = useState([]);
    const [selectedTermId, setSelectedTermId] = useState(null);
    const [currentTermName, setCurrentTermName] = useState(null);
    const [termsError, setTermsError] = useState(null);

    // Added courses built up by fetchCourse() calls
    const [courses, setCourses] = useState([]);
    const [addStatus, setAddStatus] = useState({ loading: false, error: null });

    // Schedule viewing state
    const [index, setIndex] = useState(0);
    const [generated, setGenerated] = useState(null);

    // Settings that narrow down generated schedules (time window, etc.)
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);

    // empty dependency array
    useEffect(() => {
        fetchTerms()
            .then((list) => {
                setTerms(list);
                if (list.length > 0) {
                    setSelectedTermId(list[0].id);
                    setCurrentTermName(
                        list[0].name.replace(/\s*\(UBC-[VO]\)$/, "")
                    );
                }
            })
            .catch((err) => setTermsError(err.message));
    }, []);

    const displayTerms = [
        ...new Set(
            terms.map(term =>
                term.name.replace(/\s*\(UBC-[VO]\)$/, "")
            )
        )
    ];

    const handleCampusChange = (campus) => {
        setCampus(campus);
        handleTermChange(currentTermName, campus);
    }

    const handleTermChange = (termName, campusName = campus) => { // termName: 2025-26 Winter Term 1
        setCurrentTermName(termName);
        campusName === "Vancouver" ? termName = `${termName} (UBC-V)` : termName = `${termName} (UBC-O)`;
        const termId = terms.find(term => term.name === termName).id;
        setSelectedTermId(termId);
        setCourses([]);
        setGenerated(null);
        setIndex(0);
        setAddStatus({ loading: false, error: null });
    };

    const handleAddCourse = async (dept, courseNumber) => {
        campus === "Vancouver" ? dept = (`${dept}_V`) : dept = (`${dept}_O`);
        const code = `${dept} ${courseNumber}`;
        if (courses.some((c) => c.code === code)) {
            setAddStatus({ loading: false, error: `${code} is already added.` });
            return;
        }

        setAddStatus({ loading: true, error: null });
        try {
            const course = await fetchCourse(dept, courseNumber, selectedTermId, courses.length);
            setCourses((prev) => [...prev, course]);
            setGenerated(null); // any previously generated schedules no longer reflect the full course list
            setIndex(0);
            setAddStatus({ loading: false, error: null });
        } catch (err) {
            setAddStatus({ loading: false, error: err.message });
        }
    };

    const handleRemoveCourse = (code) => {
        setCourses((prev) => prev.filter((c) => c.code !== code));
        setGenerated(null);
        setIndex(0);
    };

    // Courses with any section outside the allowed hour window stripped out
    // const filteredCourses = useMemo(() => {
    //     const startMin = settings.startHour * 60;
    //     const endMin = settings.endHour * 60;
    //     return courses.map((c) => ({
    //         ...c,
    //         components: Object.fromEntries(
    //             Object.entries(c.components).map(([type, options]) => [
    //                 type,
    //                 options.filter((o) => {
    //                     const withinTime = o.days.length === 0 || (o.start >= startMin && o.end <= endMin);
    //                     const statusAllowed = !settings.excludedStatuses.includes(o.status);
    //                     return withinTime && statusAllowed;
    //                 }),
    //             ])
    //         ),
    //     }));
    // }, [courses, settings]);

    const { filteredCourses, unavailableComponents } = useMemo(() => {
        const startMin = settings.startHour * 60;
        const endMin = settings.endHour * 60;
        const unavailable = [];

        const filtered = courses.map((c) => {
            const newComponents = {};
            for (const [type, options] of Object.entries(c.components)) {
                // course genuinely doesn't offer this component type — skip it,
                // same as the old scheduler.js check used to
                if (options.length === 0) continue;

                const kept = options.filter((o) => {
                    const withinTime = o.days.length === 0 || (o.start >= startMin && o.end <= endMin);
                    const statusAllowed = !settings.excludedStatuses.includes(o.status);
                    return withinTime && statusAllowed;
                });

                newComponents[type] = kept; // may end up [] — that's meaningful now
                if (kept.length === 0) {
                    unavailable.push({ courseCode: c.code, type });
                }
            }
            return { ...c, components: newComponents };
        });

        return { filteredCourses: filtered, unavailableComponents: unavailable };
    }, [courses, settings]);

    const schedules = useMemo(() => {
        if (!generated) return [];
        return generateSchedules(courses.map((c) => c.code), filteredCourses);
    }, [generated, filteredCourses, courses]);

    const current = schedules[index];

    if (termsError) {
        return (
            <div style={{ padding: "24px", color: "#B5563C", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Couldn't load terms from the backend ({termsError}). Is the server running on localhost:3001?
            </div>
        );
    }

    if (terms.length === 0) {
        return (
            <div style={{ padding: "24px", color: "#5A6B7A", fontFamily: "'Inter', system-ui, sans-serif" }}>
                Loading terms…
            </div>
        );
    }

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
                campus={campus}
                onCampusChange={handleCampusChange}
                terms={displayTerms}
                selectedTermId={selectedTermId}
                onTermChange={handleTermChange}
                courses={courses}
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
                addStatus={addStatus}
                onGenerate={() => { setGenerated(true); setIndex(0); }}
                settings={settings}
                onSettingsChange={setSettings}
            />

            <div style={{ flex: 1, padding: "24px 28px", overflow: "auto" }}>
                {!generated && (
                    <EmptyState
                        title="Add your courses, then generate"
                        message="Search for courses by subject and number on the left. The engine will search every combination of lecture, lab, and tutorial sections and show you only the ones with zero time conflicts."
                    />
                )}

                {generated && schedules.length === 0 && (
                    <EmptyState
                        tone="error"
                        title={unavailableComponents.length > 0 ? "No available schedules" : "No conflict-free combination exists"}
                        message={
                            unavailableComponents.length > 0
                                ? `${unavailableComponents.map((u) => `${u.courseCode} ${u.type}`).join(", ")} ${unavailableComponents.length > 1 ? "have" : "has"
                                } no sections matching your current filters. Try loosening the time range or status filters.`
                                : "Every section pairing for these courses overlaps somewhere. Try removing a course or swapping one out to see if a valid schedule opens up."
                        }
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
