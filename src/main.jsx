import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div style={{ padding: "32px", background: "#EDEFF2", minHeight: "100vh", boxSizing: "border-box" }}>
      <App />
    </div>
  </React.StrictMode>
);
