import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  CalendarClock,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import TopBar from "../components/TopBar";
import DateTimePicker from "../components/DateTimePicker";
import CustomerDetailModal from "../components/CustomerDetailModal";
import {
  getCustomers,
  updateCustomer,
  subscribe,
} from "../store/customerStore";

function classifyCall(dateStr) {
  if (!dateStr) return null;
  const now = new Date();
  const callDate = new Date(dateStr);

  // Overdue = the exact scheduled moment has already passed
  if (callDate < now) return "overdue";

  // Future calls — compare at day level only
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const callDay = new Date(callDate);
  callDay.setHours(0, 0, 0, 0);
  const diff = (callDay - todayStart) / (1000 * 60 * 60 * 24);

  if (diff === 0) return "today"; // same day, time not yet reached
  if (diff <= 3) return "soon";
  return "upcoming";
}

const LABEL = {
  overdue: { text: "Overdue", emoji: "🔴", cls: "badge-hot" },
  today: { text: "Today", emoji: "🟡", cls: "badge-warm" },
  soon: { text: "Soon", emoji: "🟠", cls: "badge-warm" },
  upcoming: { text: "Upcoming", emoji: "🟢", cls: "badge-paid" },
};

export default function Reminders({ showToast, preFilter = "all", onRefresh }) {
  const [customers, setCustomers] = useState(getCustomers);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [filterType, setFilterType] = useState(preFilter);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  // When navigating between /reminders and /missed, reset filter
  useEffect(() => {
    setFilterType(preFilter);
  }, [preFilter]);

  useEffect(() => {
    const unsub = subscribe((latest) => setCustomers([...latest]));
    return unsub;
  }, []);

  // Only customers with a nextCallDate set
  const scheduled = customers
    .filter((c) => c.nextCallDate)
    .map((c) => ({ ...c, _kind: classifyCall(c.nextCallDate) }))
    .sort((a, b) => new Date(a.nextCallDate) - new Date(b.nextCallDate));

  const filtered =
    filterType === "all"
      ? scheduled
      : scheduled.filter((c) => c._kind === filterType);

  const counts = {
    overdue: scheduled.filter((c) => c._kind === "overdue").length,
    today: scheduled.filter((c) => c._kind === "today").length,
    soon: scheduled.filter((c) => c._kind === "soon").length,
    upcoming: scheduled.filter((c) => c._kind === "upcoming").length,
  };

  function handleComplete(c) {
    updateCustomer(c.id, { nextCallDate: "", callNotes: c.callNotes });
    showToast(`✅ Call with ${c.name} marked as completed`, "success");
  }

  function openReschedule(c) {
    setRescheduleTarget(c);
    setNewDate(c.nextCallDate || "");
  }

  function handleReschedule() {
    if (!newDate) return;
    updateCustomer(rescheduleTarget.id, { nextCallDate: newDate });
    showToast(`📅 Rescheduled call with ${rescheduleTarget.name}`, "success");
    setRescheduleTarget(null);
    setNewDate("");
  }

  function openWhatsApp(number) {
    const cleaned = number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  }

  return (
    <>
      <TopBar
        title={preFilter === "overdue" ? "Missed Calls" : "Reminders"}
        subtitle={
          preFilter === "overdue"
            ? `${filtered.length} call${filtered.length !== 1 ? "s" : ""} missed`
            : `${scheduled.length} scheduled call${scheduled.length !== 1 ? "s" : ""}`
        }
        onRefresh={onRefresh}
      />

      <div className="page-content">
        {/* Summary pills */}
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="filter-scroll">
            <button
              className={`filter-pill ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All ({scheduled.length})
            </button>
            {counts.overdue > 0 && (
              <button
                className={`filter-pill ${filterType === "overdue" ? "active" : ""}`}
                onClick={() => setFilterType("overdue")}
                style={{ color: "var(--accent-red)" }}
              >
                🔴 Overdue ({counts.overdue})
              </button>
            )}
            {counts.today > 0 && (
              <button
                className={`filter-pill ${filterType === "today" ? "active" : ""}`}
                onClick={() => setFilterType("today")}
              >
                🟡 Today ({counts.today})
              </button>
            )}
            {counts.soon > 0 && (
              <button
                className={`filter-pill ${filterType === "soon" ? "active" : ""}`}
                onClick={() => setFilterType("soon")}
              >
                🟠 Soon ({counts.soon})
              </button>
            )}
            {counts.upcoming > 0 && (
              <button
                className={`filter-pill ${filterType === "upcoming" ? "active" : ""}`}
                onClick={() => setFilterType("upcoming")}
              >
                🟢 Upcoming ({counts.upcoming})
              </button>
            )}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Bell size={48} />
            <h4>
              No reminders {filterType !== "all" ? `in "${filterType}"` : ""}
            </h4>
            <p>Schedule a next call date on any customer to see it here.</p>
          </div>
        )}

        {/* Reminder cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((c) => {
            const kind = LABEL[c._kind];
            const callDate = new Date(c.nextCallDate);
            // Show date + time if time is set (not midnight)
            const hasTime =
              c.nextCallDate.includes("T") &&
              !c.nextCallDate.endsWith("T00:00");
            const formattedDate = callDate.toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = hasTime
              ? callDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : null;

            return (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  borderLeft: `4px solid ${
                    c._kind === "overdue"
                      ? "var(--accent-red)"
                      : c._kind === "today"
                        ? "#f59e0b"
                        : c._kind === "soon"
                          ? "#f97316"
                          : "var(--accent-green)"
                  }`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  cursor: "pointer",
                }}
                onClick={() => setViewingCustomer(c)}
              >
                {/* Top row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      className="cc-avatar"
                      style={{
                        width: 38,
                        height: 38,
                        fontSize: 15,
                        flexShrink: 0,
                      }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>
                        {c.name}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {c.whatsapp}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`badge ${kind.cls}`}
                    style={{ fontSize: 12 }}
                  >
                    {kind.emoji} {kind.text}
                  </span>
                </div>

                {/* Date + notes */}
                <div
                  style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                >
                  <CalendarClock
                    size={15}
                    style={{
                      marginTop: 2,
                      flexShrink: 0,
                      color: "var(--text-secondary)",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                      {formattedDate}
                      {formattedTime && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontWeight: 500,
                            color: "var(--accent-blue, #60a5fa)",
                            fontSize: 12,
                          }}
                        >
                          ⏰ {formattedTime}
                        </span>
                      )}
                    </div>
                    {c.callNotes && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginTop: 3,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {c.callNotes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 2,
                  }}
                >
                  <button
                    className="btn btn-primary"
                    style={{
                      fontSize: 12,
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleComplete(c);
                    }}
                  >
                    <CheckCircle2 size={14} /> Done
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{
                      fontSize: 12,
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openReschedule(c);
                    }}
                  >
                    <RefreshCw size={14} /> Reschedule
                  </button>
                  <button
                    className="cc-action-btn btn-whatsapp-solid"
                    style={{
                      fontSize: 12,
                      padding: "6px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 8,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(c.whatsapp);
                    }}
                  >
                    <MessageCircle size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CustomerDetailModal
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
      />

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <div
          className="modal-overlay"
          onClick={() => setRescheduleTarget(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 360 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Reschedule Call</h3>
            </div>
            <div className="modal-body">
              <p
                style={{
                  marginBottom: 12,
                  color: "var(--text-secondary)",
                  fontSize: 14,
                }}
              >
                Rescheduling call with{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {rescheduleTarget.name}
                </strong>
              </p>
              <div className="form-group">
                <label className="form-label">📅 New Call Date & Time</label>
                <DateTimePicker
                  name="newDate"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setRescheduleTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleReschedule}
                disabled={!newDate}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
