export const DAY_ORDER = ["m", "t", "w", "th", "f"];
export const DAY_LABEL = { m: "Mon", t: "Tue", w: "Wed", th: "Thu", f: "Fri" };

// "09:30" -> 570 (minutes since midnight). Storing times as plain numbers
// makes every later comparison a simple numeric comparison
export function t(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// 570 -> "9:30am"
export function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

// The calendar's visible time window and vertical scale
export const DAY_START = t("08:00");
export const DAY_END = t("20:00");
export const PX_PER_MIN = 1.1;
