export const DAY_ORDER = ["M", "T", "W", "R", "F"];
export const DAY_LABEL = { M: "Mon", T: "Tue", W: "Wed", R: "Thu", F: "Fri" };

export function t(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fmtTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${period}` : `${h12}:${String(m).padStart(2, "0")}${period}`;
}

export const DAY_START = t("08:00");
export const DAY_END = t("18:00");
export const PX_PER_MIN = 1.1;
