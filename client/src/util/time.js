export const DAY_ORDER = ["m", "t", "w", "th", "f"];
export const DAY_LABEL = { m: "Mon", t: "Tue", w: "Wed", th: "Thu", f: "Fri" };

/**
 * Parses a 24 hour "HH:MM" string into minutes since midnight
 * @param {string} hhmm - time string, e.g. "09:30"
 * @returns {number} minutes since midnight, e.g. 570
 */
export function t(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Formats minutes since midnight into 12 hour string,
 * omits ":00" when the time is on the hour.
 * @param {number} mins - minutes since midnight, e.g. 570
 * @returns {string} display string, e.g. "9:30am" or "9am"
 */
export function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

export const DAY_START = t("08:00");
export const DAY_END = t("20:00");
export const PX_PER_MIN = 0.97;
