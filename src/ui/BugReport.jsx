import { useState } from "react";
import { submitBugReport } from "../api/ubcApi.js";
import {Bug} from "lucide-react";

const INITIAL_FORM = { email: "", description: "" };

export default function BugReport() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [status, setStatus] = useState({ loading: false, error: null, sent: false });

    const close = () => {
        setOpen(false);
        // Small delay so the form doesn't visibly reset before closing
        setTimeout(() => {
            setForm(INITIAL_FORM);
            setStatus({ loading: false, error: null, sent: false });
        }, 200);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.trim() || !form.description.trim()) return;

        setStatus({ loading: true, error: null, sent: false });
        try {
            await submitBugReport(form.email.trim(), form.description.trim());
            setStatus({ loading: false, error: null, sent: true });
        } catch (err) {
            setStatus({ loading: false, error: err.message, sent: false });
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="cs-btn"
                style={{
                    position: "absolute",
                    top: "53px",
                    right: "65px",
                    zIndex: 40,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#F5F6F8",
                    cursor: "pointer",
                }}
            >
                <Bug size={18} />
            </button>

            {open && (
                <div
                    onClick={close}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 32, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 50,
                        padding: "24px",
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: "440px",
                            maxWidth: "100%",
                            background: "#fff",
                            color: "#14202B",
                            borderRadius: "14px",
                            border: "1px solid #DCE2E7",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                            padding: "24px 26px",
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                            <div style={{ fontFamily: "'Fraunces', serif", fontSize: "18px", color: "#1F3A5C" }}>
                                Report a bug
                            </div>
                            <button
                                onClick={close}
                                aria-label="Close bug report form"
                                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#5A6B7A", lineHeight: 1, padding: "4px" }}
                            >
                                ×
                            </button>
                        </div>

                        {status.sent ? (
                            <div style={{ padding: "20px 0 8px", fontSize: "13.5px", color: "#3D7068" }}>
                                Thanks, your report was sent.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div style={{ fontSize: "12px", color: "#8898A6", margin: "10px 0 18px" }}>
                                    Ran into something broken? Describe what happened.
                                </div>

                                <label style={labelStyle}>Your email</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    style={inputStyle}
                                />

                                <label style={{ ...labelStyle, marginTop: "14px" }}>What went wrong?</label>
                                <textarea
                                    required
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={5}
                                    style={{ ...inputStyle, resize: "vertical", fontFamily: "'Inter', system-ui, sans-serif" }}
                                />

                                {status.error && (
                                    <div style={{ fontSize: "12px", color: "#B5563C", marginTop: "10px" }}>
                                        {status.error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="cs-btn"
                                    disabled={status.loading}
                                    style={{
                                        marginTop: "18px",
                                        width: "100%",
                                        padding: "11px",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#C99A3E",
                                        color: "#1F2A16",
                                        fontWeight: 600,
                                        fontSize: "13.5px",
                                        cursor: status.loading ? "wait" : "pointer",
                                    }}
                                >
                                    {status.loading ? "Sending…" : "Send report"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

const labelStyle = {
    display: "block",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#5A6B7A",
    marginBottom: "6px",
};

const inputStyle = {
    width: "100%",
    padding: "9px 10px",
    borderRadius: "8px",
    border: "1px solid #DCE2E7",
    background: "#fff",
    color: "#14202B",
    fontSize: "13px",
    boxSizing: "border-box",
};