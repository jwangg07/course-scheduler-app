import { COLORS } from "../util/theme";

// Defaults for ungenerated / empty schedules
export default function EmptyState({ tone = "neutral", title, message }) {
  const titleColor = tone === "error" ? COLORS.ERROR : COLORS.TEXT_DARK;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: tone === "error" ? "20px" : "22px", color: titleColor, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "14px", color: COLORS.TEXT_DARK+"BF", maxWidth: "420px", lineHeight: 1.6 }}>
        {message}
      </div>
    </div>
  );
}
