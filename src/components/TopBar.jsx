import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function TopBar({ title, subtitle, onRefresh, children }) {
  const [spinning, setSpinning] = useState(false);

  async function handleRefresh() {
    if (spinning || !onRefresh) return;
    setSpinning(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setSpinning(false), 600);
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            title="Refresh from database"
            style={{
              background: "transparent",
              border: "1px solid var(--border-color)",
              borderRadius: 8,
              padding: "7px 9px",
              cursor: spinning ? "not-allowed" : "pointer",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--text-primary)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-secondary)")
            }
          >
            <RefreshCw
              size={16}
              style={{
                transition: "transform 0.6s ease",
                transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
              }}
            />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
