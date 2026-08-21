import { COLORS } from "../util/theme";

// Placeholder UI shown while backend fetchTerms() is loading 
export default function SkeletonLoader() {
    return (
        <div style={{
            display: "flex",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #DCE2E7",
            minHeight: "600px",
        }}>
            {/* Sidebar Skeleton */}
            <div style={{ width: "450px", background: COLORS.PRIMARY, padding: "24px 20px", flexShrink: 0 }}>
                {/* Title + subtitle */}
                <div className="skeleton-dark" style={{ width: "190px", height: "22px", marginBottom: "8px" }} />
                <div className="skeleton-dark" style={{ width: "130px", height: "13px", marginBottom: "26px" }} />

                {/* Campus select */}
                <div className="skeleton-dark" style={{ width: "55px", height: "10px", marginBottom: "8px" }} />
                <div className="skeleton-dark" style={{ width: "100%", height: "36px", marginBottom: "20px" }} />

                {/* Term select */}
                <div className="skeleton-dark" style={{ width: "40px", height: "10px", marginBottom: "8px" }} />
                <div className="skeleton-dark" style={{ width: "100%", height: "36px", marginBottom: "20px" }} />

                {/* Add course form row */}
                <div className="skeleton-dark" style={{ width: "95px", height: "10px", marginBottom: "8px" }} />
                <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
                    <div className="skeleton-dark" style={{ width: "70px", height: "36px" }} />
                    <div className="skeleton-dark" style={{ flex: 1, height: "36px" }} />
                    <div className="skeleton-dark" style={{ width: "50px", height: "36px" }} />
                </div>

                {/* "No courses added yet." */}
                <div className="skeleton-dark" style={{ width: "150px", height: "13px", margin: "16px 0 20px" }} />

                {/* Generate button (disabled) */}
                <div style={{ width: "100%", height: "38px", borderRadius: "8px", background: "#3E5872" }} />

                {/* Settings Skeleton */}
                <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #3E5872" }}>
                    <div className="skeleton-dark" style={{ width: "60px", height: "10px", marginBottom: "12px" }} />

                    {/* Time range selector */}
                    <div className="skeleton-dark" style={{ width: "230px", height: "12px", marginBottom: "8px" }} />
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
                        <div className="skeleton-dark" style={{ flex: 1, height: "34px" }} />
                        <div className="skeleton-dark" style={{ width: "16px", height: "10px" }} />
                        <div className="skeleton-dark" style={{ flex: 1, height: "34px" }} />
                    </div>

                    {/* Status filters */}
                    <div className="skeleton-dark" style={{ width: "170px", height: "12px", marginBottom: "10px" }} />
                    <div style={{ display: "flex", gap: "2rem" }}>
                        {[0, 1].map((i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div className="skeleton-dark" style={{ width: "15px", height: "15px", borderRadius: "3px" }} />
                                <div className="skeleton-dark" style={{ width: "50px", height: "11px" }} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* EmptyState Skeleton */}
            <div style={{ flex: 1, padding: "24px 28px", background: "#F4F6F8", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {/* Title line */}
                <div className="skeleton" style={{ width: "340px", height: "22px", marginBottom: "12px" }} />

                {/* Paragraph */}
                <div className="skeleton" style={{ width: "420px", height: "13px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ width: "400px", height: "13px", marginBottom: "8px" }} />
                <div className="skeleton" style={{ width: "260px", height: "13px" }} />
            </div>
        </div>
    );
}