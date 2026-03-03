import { X, MessageCircle, Edit2, Phone, MapPin, Calendar, FileText, AlertCircle, Package } from "lucide-react";

const STATUS_LABELS = {
    hot: "🔥 Hot",
    warm: "🌡️ Warm",
    "not-interested": "👎 Not Interested",
};

const STATUS_STYLE = {
    hot: { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" },
    warm: { background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)" },
    "not-interested": { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid #f87171" },
};

const PAYMENT_STYLE = {
    paid: { background: "rgba(52,211,153,0.15)", color: "#34d399", border: "1px solid rgba(52,211,153,0.3)" },
    pending: { background: "rgba(251,146,60,0.15)", color: "#fb923c", border: "1px solid rgba(251,146,60,0.3)" },
};

const RESTAURANT_LABELS = {
    restaurant: "🍽️ Restaurant",
    cafe: "☕ Cafe",
    "juice-shop": "🥤 Juice Shop",
    hotel: "🏨 Hotel",
};

function Row({ icon: Icon, label, value, valueStyle }) {
    if (!value) return null;
    return (
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--border-color)" }}>
            <Icon size={16} style={{ color: "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: "var(--text-primary)", fontWeight: 500, whiteSpace: "pre-wrap", wordBreak: "break-word", ...valueStyle }}>{value}</div>
            </div>
        </div>
    );
}

export default function CustomerDetailModal({ customer, onClose, onEdit }) {
    if (!customer) return null;

    function openWhatsApp() {
        const cleaned = customer.whatsapp.replace(/[^0-9]/g, "");
        window.open(`https://wa.me/${cleaned}`, "_blank");
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        const date = d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
        const hasTime = dateStr.includes("T") && !dateStr.endsWith("T00:00");
        if (!hasTime) return date;
        const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
        return `${date} · ${time}`;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                style={{ maxWidth: 440, padding: 0, overflow: "hidden" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with avatar */}
                <div style={{
                    background: "linear-gradient(135deg, var(--accent-primary) 0%, #4f3bdb 100%)",
                    padding: "20px 20px 16px",
                    position: "relative",
                }}>
                    <button
                        onClick={onClose}
                        style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: "4px 8px", cursor: "pointer", color: "#fff" }}
                    >
                        <X size={16} />
                    </button>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: "50%",
                            background: "rgba(255,255,255,0.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>
                            {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{customer.name}</div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{customer.whatsapp}</div>
                            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600, ...STATUS_STYLE[customer.status] }}>
                                    {STATUS_LABELS[customer.status] || customer.status}
                                </span>
                                <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, fontWeight: 600, ...PAYMENT_STYLE[customer.paymentStatus] }}>
                                    {customer.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: "4px 20px 8px" }}>
                    <Row icon={Phone} label="WhatsApp" value={customer.whatsapp} />
                    <Row
                        icon={FileText}
                        label="Total Amount"
                        value={`₹${(customer.amount || 0).toLocaleString("en-IN")}`}
                        valueStyle={{ fontWeight: 600, fontSize: 16 }}
                    />
                    {customer.paidAmount > 0 && (
                        <Row
                            icon={FileText}
                            label="Paid Amount"
                            value={`₹${(customer.paidAmount || 0).toLocaleString("en-IN")}`}
                            valueStyle={{ color: "#34d399", fontWeight: 700, fontSize: 15 }}
                        />
                    )}
                    {(customer.amount - (customer.paidAmount || 0)) > 0 && (
                        <Row
                            icon={FileText}
                            label="Pending Amount"
                            value={`₹${(customer.amount - (customer.paidAmount || 0)).toLocaleString("en-IN")}`}
                            valueStyle={{ color: "#fb923c", fontWeight: 700, fontSize: 15 }}
                        />
                    )}
                    <Row icon={MapPin} label="Location" value={customer.location} />
                    <Row icon={Package} label="Restaurant Type" value={RESTAURANT_LABELS[customer.restaurantType] || customer.restaurantType} />
                    <Row icon={Package} label="Product" value={customer.productType} />
                    <Row icon={Calendar} label="Next Call" value={formatDateTime(customer.nextCallDate)} />
                    <Row icon={FileText} label="Call Notes" value={customer.callNotes} />
                    {customer.status === "not-interested" && (
                        <Row icon={AlertCircle} label="Reason Not Interested" value={customer.notInterestedReason} valueStyle={{ color: "#f87171" }} />
                    )}
                </div>

                {/* Footer actions */}
                <div style={{ display: "flex", gap: 10, padding: "12px 20px 20px", borderTop: "1px solid var(--border-color)" }}>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                        onClick={openWhatsApp}
                    >
                        <MessageCircle size={16} /> WhatsApp
                    </button>
                    {onEdit && (
                        <button
                            className="btn btn-secondary"
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                            onClick={() => { onClose(); onEdit(customer); }}
                        >
                            <Edit2 size={16} /> Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
