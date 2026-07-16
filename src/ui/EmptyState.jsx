// Defaults for ungenerated / empty schedules
export default function EmptyState({ tone = "neutral", title, message }) {
  const titleColor = tone === "error" ? "#B5563C" : "#1F3A5C";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: tone === "error" ? "20px" : "22px", color: titleColor, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "14px", color: "#5A6B7A", maxWidth: "420px", lineHeight: 1.6 }}>
        {message}
      </div>
    </div>
  );
}
