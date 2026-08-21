import { useEffect, useMemo, useState } from "react";
import { generateSchedules } from "./util/scheduler.js";
import { fetchTerms, fetchCourse } from "./api/ubcApi.js";
import CourseSidebar from "./ui/CourseSidebar.jsx";
import ScheduleCalendar from "./ui/ScheduleCalendar.jsx";
import ScheduleNav from "./ui/ScheduleNav.jsx";
import EmptyState from "./ui/EmptyState.jsx";
import { DEFAULT_SETTINGS } from "./ui/ScheduleSettings.jsx";
import SkeletonLoader from "./ui/SkeletonLoader.jsx";
import BugReport from "./ui/BugReport.jsx";
import { COLORS } from "./util/theme.js"

export default function App() {
    const [campus, setCampus] = useState("Vancouver");
    const [terms, setTerms] = useState([]);
    const [selectedTerm, setSelectedTerm] = useState(null); // e.g. { id: 1449, name: "2025-26 Winter Term 1 (UBC-V)" }
    const [termsError, setTermsError] = useState(null);
    const [courses, setCourses] = useState([]); // E.g. { title: 'Symbolic Logic', code: 'PHIL_V 220', components: {Lecture: Array(4)}, color: '#3D7068' }[]
    const [addStatus, setAddStatus] = useState({ loading: false, error: null });
    const [index, setIndex] = useState(0); // schedule view state
    const [generated, setGenerated] = useState(null);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [sectionSelections, setSectionSelections] = useState({}); // locked sections

    useEffect(() => {
        fetchTerms()
            .then((termsList) => {
                setTerms(termsList);
                if (termsList.length > 0) {
                    setSelectedTerm(termsList[0]);
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
        handleTermChange(selectedTerm.name, campus); // must pass campus manually because setCampus() is asynchronous
    }

    /**
     * Changes the term, accounting for current campus selection, and resets states
     * @param {string} termName - Full name of the term (e.g. "2025-26 Winter Term 1 (UBC-V)")
     * @param {string} [campusName] - Name of the campus (optional, used for {@link handleCampusChange})
     */
    const handleTermChange = (termName, campusName = campus) => {
        campusName === "Vancouver" ?
            termName = termName.replace("UBC-O", "UBC-V")
            : termName = termName.replace("UBC-V", "UBC-O");

        setSelectedTerm(terms.find(term => term.name === termName));

        setCourses([]);
        setSectionSelections({});
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
            const course = await fetchCourse(dept, courseNumber, selectedTerm.id, courses.length);
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
        setSectionSelections((prev) => { // Drop course's section overrides too
            const { [code]: _removed, ...rest } = prev;
            return rest;
        });
        setGenerated(null);
        setIndex(0);
    };

    // Toggle one specific section on/off for a course/type
    const handleToggleSection = (courseCode, type, sectionId) => {
        setSectionSelections((prev) => {
            const course = courses.find((c) => c.code === courseCode);
            const courseSel = prev[courseCode] ?? {};
            // If we haven't touched this type before, start from "everything
            // allowed" (i.e. every id currently offered for that type)
            const currentIds = courseSel[type] ?? new Set(course.components[type].map((o) => o.label));
            const nextIds = new Set(currentIds);
            if (nextIds.has(sectionId)) nextIds.delete(sectionId);
            else nextIds.add(sectionId);
            return { ...prev, [courseCode]: { ...courseSel, [type]: nextIds } };
        });
    };

    // "All" button — clear the override entirely so it goes back to
    // "everything allowed" rather than storing a full set of every id
    const handleSelectAllSections = (courseCode, type) => {
        setSectionSelections((prev) => {
            const courseSel = prev[courseCode] ?? {};
            const { [type]: _removed, ...rest } = courseSel;
            return { ...prev, [courseCode]: rest };
        });
    };

    // "None" button — an empty Set means zero sections of this type allowed
    const handleSelectNoSections = (courseCode, type) => {
        setSectionSelections((prev) => {
            const courseSel = prev[courseCode] ?? {};
            return { ...prev, [courseCode]: { ...courseSel, [type]: new Set() } };
        });
    };

    const { filteredCourses, unavailableComponents } = useMemo(() => {
        const startMin = settings.startHour * 60;
        const endMin = settings.endHour * 60;
        const unavailable = [];

        const filtered = courses.map((c) => {
            const sel = sectionSelections[c.code]; // this course's overrides, if any
            const newComponents = {};
            for (const [type, options] of Object.entries(c.components)) { // e.g. [type, options] === ["Lecture", Array(4)]
                if (options.length === 0) continue;

                const kept = options.filter((o) => {
                    const withinTime = o.days.length === 0 || (o.start >= startMin && o.end <= endMin);
                    const statusAllowed = !settings.excludedStatuses.includes(o.status);
                    // No entry for this type => user hasn't restricted it => allow all
                    const sectionAllowed = !sel?.[type] || sel[type].has(o.label);
                    return withinTime && statusAllowed && sectionAllowed;
                });

                newComponents[type] = kept; // may end up []
                if (kept.length === 0) {
                    unavailable.push({ courseCode: c.code, type });
                }
            }
            setIndex(0);
            return { ...c, components: newComponents };
        });

        return { filteredCourses: filtered, unavailableComponents: unavailable };
    }, [courses, settings, sectionSelections]);

    const schedules = useMemo(() => {
        if (!generated) return [];
        if (unavailableComponents.length > 0) return [];
        else return generateSchedules(filteredCourses);
    }, [generated, filteredCourses, courses]);

    const current = schedules[index];

    if (termsError) {
        return (
            <>
                <BugReport />
                <div style={{ padding: "24px", color: COLORS.ERROR, fontFamily: "'Inter', system-ui, sans-serif" }}>
                    Couldn't load terms from the backend ({termsError}).
                </div>
            </>
        );
    }

    if (terms.length === 0) {
        return (
            <>
                <BugReport />
                <SkeletonLoader />
            </>
        );
    }
    return (
        <>
            <BugReport />
            <div style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                background: COLORS.BACKGROUND,
                minHeight: "600px",
                color: COLORS.PRIMARY,
                display: "flex",
                borderRadius: "14px",
                overflow: "hidden",
                border: `1px solid ${COLORS.ACCENT}`,
            }}>
                <CourseSidebar
                    campus={campus}
                    onCampusChange={handleCampusChange}
                    terms={displayTerms}
                    onTermChange={handleTermChange}
                    courses={courses}
                    onAddCourse={handleAddCourse}
                    onRemoveCourse={handleRemoveCourse}
                    addStatus={addStatus}
                    onGenerate={() => { setGenerated(true); setIndex(0); }}
                    settings={settings}
                    onSettingsChange={setSettings}
                    sectionSelections={sectionSelections}
                    onToggleSection={handleToggleSection}
                    onSelectAllSections={handleSelectAllSections}
                    onSelectNoSections={handleSelectNoSections}
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
                                    } no sections matching your current filters. Try loosening the time range, status, or section filters.`
                                    : "Every section pairing for these courses overlaps somewhere. Try removing a course or swapping one out to see if a valid schedule opens up."
                            }
                        />
                    )}

                    {generated && schedules.length > 0 && (
                        <>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px", marginRight: "75px" }}>
                                <div style={{ fontFamily: "'Fraunces', serif", fontSize: "19px", color: COLORS.PRIMARY }}>
                                    {schedules.length === 100 ? "99+" : schedules.length} valid schedule{schedules.length > 1 ? "s" : ""} found
                                </div>
                                <ScheduleNav
                                    index={index}
                                    total={schedules.length}
                                    onPrev={() => setIndex((i) => Math.max(0, i - 1))}
                                    onNext={() => setIndex((i) => Math.min(schedules.length - 1, i + 1))}
                                />
                            </div>

                            <ScheduleCalendar schedule={current} settings={settings} />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
