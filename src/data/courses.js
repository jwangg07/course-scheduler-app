// sample data
import { t } from "../util/time.js";

export const COURSES = [
  {
    code: "CPSC 110",
    title: "Computation, Programs, and Programming",
    color: "#3D7068",
    components: {
      LEC: [
        { id: "CPSC110-L01", label: "L01", days: ["M", "W", "F"], start: t("09:00"), end: t("10:00"), instructor: "Reid" },
        { id: "CPSC110-L02", label: "L02", days: ["T", "R"], start: t("11:00"), end: t("12:30"), instructor: "Wolfman" },
      ],
      LAB: [
        { id: "CPSC110-B1A", label: "L1A", days: ["T"], start: t("14:00"), end: t("15:00") },
        { id: "CPSC110-B1B", label: "L1B", days: ["W"], start: t("15:00"), end: t("16:00") },
        { id: "CPSC110-B1C", label: "L1C", days: ["R"], start: t("10:00"), end: t("11:00") },
      ],
    },
  },
  {
    code: "MATH 100",
    title: "Differential Calculus",
    color: "#4A7FA6",
    components: {
      LEC: [
        { id: "MATH100-201", label: "201", days: ["M", "W", "F"], start: t("10:00"), end: t("11:00"), instructor: "Anstee" },
        { id: "MATH100-202", label: "202", days: ["M", "W", "F"], start: t("13:00"), end: t("14:00"), instructor: "Loewen" },
      ],
      TUT: [
        { id: "MATH100-T1A", label: "T1A", days: ["F"], start: t("14:00"), end: t("15:00") },
        { id: "MATH100-T1B", label: "T1B", days: ["M"], start: t("15:00"), end: t("16:00") },
      ],
    },
  },
  {
    code: "ENGL 112",
    title: "Strategies for University Writing",
    color: "#6B5B95",
    components: {
      LEC: [
        { id: "ENGL112-101", label: "101", days: ["T", "R"], start: t("09:30"), end: t("11:00"), instructor: "Pierce" },
        { id: "ENGL112-102", label: "102", days: ["M", "W", "F"], start: t("11:00"), end: t("12:00"), instructor: "Okafor" },
      ],
    },
  },
  {
    code: "PHYS 101",
    title: "Energy and Waves",
    color: "#B5563C",
    components: {
      LEC: [
        { id: "PHYS101-001", label: "001", days: ["M", "W", "F"], start: t("09:00"), end: t("10:00"), instructor: "Hallin" },
        { id: "PHYS101-002", label: "002", days: ["T", "R"], start: t("12:30"), end: t("14:00"), instructor: "Krzywinski" },
      ],
      LAB: [
        { id: "PHYS101-L2A", label: "L2A", days: ["W"], start: t("13:00"), end: t("15:00") },
        { id: "PHYS101-L2B", label: "L2B", days: ["R"], start: t("13:00"), end: t("15:00") },
      ],
    },
  },
  {
    code: "ECON 101",
    title: "Principles of Microeconomics",
    color: "#A67C3D",
    components: {
      LEC: [
        { id: "ECON101-001", label: "001", days: ["M", "W", "F"], start: t("12:00"), end: t("13:00"), instructor: "Kneebone" },
        { id: "ECON101-002", label: "002", days: ["T", "R"], start: t("15:30"), end: t("17:00"), instructor: "Ferede" },
      ],
    },
  },
  {
    // Kept from the earlier fix — pairs with ENGL 112 to genuinely produce
    // zero valid schedules, so the empty state has something real to show.
    code: "KIN 110",
    title: "Fundamentals of Human Movement",
    color: "#8C4A5B",
    components: {
      LEC: [{ id: "KIN110-001", label: "001", days: ["M", "W", "F"], start: t("11:00"), end: t("12:00") }],
      TUT: [{ id: "KIN110-T01", label: "T01", days: ["T", "R"], start: t("09:30"), end: t("11:00") }],
    },
  },
];
