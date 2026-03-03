import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  MessageCircle,
  Users as UsersIcon,
} from "lucide-react";
import TopBar from "../components/TopBar";
import CustomerModal from "../components/CustomerModal";
import CustomerDetailModal from "../components/CustomerDetailModal";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  subscribe,
} from "../store/customerStore";

const RESTAURANT_LABELS = {
  restaurant: "🍽️ Restaurant",
  cafe: "☕ Cafe",
  "juice-shop": "🥤 Juice Shop",
  hotel: "🏨 Hotel",
};

const STATUS_LABELS = {
  hot: "🔥 Hot",
  warm: "🌡️ Warm",
  "not-interested": "👎 Not Interested",
};

const STATUS_BADGE_STYLE = {
  "not-interested": {
    background: "#2a1a1a",
    color: "#f87171",
    border: "1px solid #f87171",
  },
};

export default function Customers({ showToast, onRefresh }) {
  const [customers, setCustomers] = useState(getCustomers);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const unsub = subscribe((latest) => {
      setCustomers([...latest]);
    });
    return unsub;
  }, []);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.whatsapp.includes(search) ||
      (c.location || "").toLowerCase().includes(search.toLowerCase());
    // Hide not-interested unless explicitly filtered
    const matchStatus =
      filterStatus === "all"
        ? c.status !== "not-interested"
        : c.status === filterStatus;
    const matchPayment =
      filterPayment === "all" || c.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  function handleMarkNotInterested(c) {
    updateCustomer(c.id, { status: "not-interested" });
    showToast(`${c.name} moved to Not Interested`, "success");
  }

  function handleSave(data) {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
      showToast("Customer updated", "success");
    } else {
      addCustomer(data);
      showToast("Customer added", "success");
    }
    setModalOpen(false);
    setEditingCustomer(null);
  }

  function handleEdit(customer) {
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  function handleDeleteClick(customer) {
    setDeleteTarget(customer);
    setConfirmOpen(true);
  }

  function handleDeleteConfirm() {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      showToast("Customer deleted successfully", "success");
    }
    setDeleteTarget(null);
    setConfirmOpen(false);
  }

  function openWhatsApp(number) {
    const cleaned = number.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleaned}`, "_blank");
  }

  return (
    <>
      <TopBar
        title="Customers"
        subtitle={`${filtered.length} total contacts`}
        onRefresh={onRefresh}
      >
        <button
          className="btn btn-primary btn-sm"
          style={{ padding: "10px 14px", borderRadius: 50 }}
          onClick={() => {
            setEditingCustomer(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> <span className="desktop-only">Add Customer</span>
        </button>
      </TopBar>

      <div className="page-content">
        {/* Responsive Filter Bar */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <Search />
            <input
              className="form-input"
              placeholder="Search by name, number, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Scrollable pill filters for mobile, flex for desktop */}
          <div className="filter-scroll">
            {/* Status Pills */}
            <button
              className={`filter-pill ${filterStatus === "all" ? "active" : ""}`}
              onClick={() => setFilterStatus("all")}
            >
              All Status
            </button>
            <button
              className={`filter-pill ${filterStatus === "hot" ? "active" : ""}`}
              onClick={() => setFilterStatus("hot")}
            >
              🔥 Hot Leads
            </button>
            <button
              className={`filter-pill ${filterStatus === "warm" ? "active" : ""}`}
              onClick={() => setFilterStatus("warm")}
            >
              🌡️ Warm
            </button>
            <button
              className={`filter-pill ${filterStatus === "not-interested" ? "active" : ""}`}
              onClick={() => setFilterStatus("not-interested")}
              style={{
                color:
                  filterStatus === "not-interested"
                    ? undefined
                    : "var(--text-secondary)",
              }}
            >
              👎 Not Interested
            </button>
            <div
              style={{
                width: 1,
                background: "var(--border-color)",
                margin: "0 4px",
              }}
            />
            {/* Payment Pills */}
            <button
              className={`filter-pill ${filterPayment === "all" ? "active" : ""}`}
              onClick={() => setFilterPayment("all")}
            >
              All Payments
            </button>
            <button
              className={`filter-pill ${filterPayment === "pending" ? "active" : ""}`}
              onClick={() => setFilterPayment("pending")}
            >
              ⏳ Pending
            </button>
            <button
              className={`filter-pill ${filterPayment === "paid" ? "active" : ""}`}
              onClick={() => setFilterPayment("paid")}
            >
              ✅ Paid
            </button>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <UsersIcon size={48} />
            <h4>No customers found</h4>
            <p>
              {customers.length === 0
                ? "Tap the Add Lead icon to start."
                : "Adjust your search filters."}
            </p>
          </div>
        )}

        {/* --- MOBILE CARDS VIEW --- */}
        <div className="customer-grid mobile-only">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="customer-card"
              style={{ cursor: "pointer" }}
              onClick={() => setViewingCustomer(c)}
            >
              <div className="cc-header">
                <div className="cc-profile">
                  <div className="cc-avatar">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="cc-info">
                    <h4>{c.name}</h4>
                    <p>{c.whatsapp}</p>
                    <div className="cc-badges">
                      <span className={`badge badge-${c.status}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                      <span
                        className={`badge badge-${c.restaurantType === "juice-shop" ? "juice" : c.restaurantType}`}
                      >
                        {RESTAURANT_LABELS[c.restaurantType] ||
                          c.restaurantType}
                      </span>
                      {c.productType && (
                        <span
                          className="badge"
                          style={{
                            background: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                          }}
                        >
                          {c.productType
                            .split("-")
                            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="cc-details">
                <div className="cc-amount-col">
                  <p>
                    {c.paymentStatus === "paid" ? "Paid fully" : "Pending due"}
                  </p>
                  <h3
                    className={c.paymentStatus === "pending" ? "pending" : ""}
                  >
                    ₹
                    {(c.paymentStatus === "paid"
                      ? c.amount || 0
                      : (c.amount || 0) - (c.paidAmount || 0)
                    ).toLocaleString("en-IN")}
                    {c.paymentStatus === "paid" && " ✅"}
                  </h3>
                  {c.paymentStatus === "pending" && c.paidAmount > 0 && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--text-secondary)",
                        marginTop: 2,
                      }}
                    >
                      Paid: ₹{(c.paidAmount || 0).toLocaleString("en-IN")} /
                      Total: ₹{(c.amount || 0).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>
                {(c.nextCallDate || c.callNotes) && (
                  <div
                    style={{
                      width: "100%",
                      marginTop: 8,
                      padding: "8px 0",
                      borderTop: "1px solid var(--border-color)",
                    }}
                  >
                    {c.nextCallDate && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          marginBottom: 4,
                        }}
                      >
                        📅 <strong>Next Call:</strong>{" "}
                        {new Date(c.nextCallDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {c.nextCallDate.includes("T") &&
                          !c.nextCallDate.endsWith("T00:00") && (
                            <span style={{ marginLeft: 6, color: "#60a5fa" }}>
                              ⏰{" "}
                              {new Date(c.nextCallDate).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </span>
                          )}
                      </p>
                    )}
                    {c.callNotes && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        📝 {c.callNotes}
                      </p>
                    )}
                  </div>
                )}
                <div className="cc-actions">
                  <button
                    className="cc-action-btn btn-whatsapp-solid"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsApp(c.whatsapp);
                    }}
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    className="cc-action-btn btn-edit-solid"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(c);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    className="cc-action-btn btn-edit-solid"
                    style={{ color: "var(--accent-red)" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(c);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- DESKTOP TABLE VIEW --- */}
        <div className="desktop-only card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Product</th>
                <th>Next Call</th>
                <th>Call Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setViewingCustomer(c)}
                >
                  <td>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        className="cc-avatar"
                        style={{ width: 32, height: 32, fontSize: 13 }}
                      >
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {c.whatsapp}
                  </td>
                  <td>
                    <span className={`badge badge-${c.status}`}>
                      <span className="badge-dot" />
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge badge-${c.paymentStatus === "paid" ? "paid" : "pending"}`}
                    >
                      <span className="badge-dot" />
                      {c.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        color:
                          c.paymentStatus === "paid"
                            ? "var(--text-primary)"
                            : "#fb923c",
                      }}
                    >
                      ₹
                      {(c.paymentStatus === "paid"
                        ? c.amount || 0
                        : (c.amount || 0) - (c.paidAmount || 0)
                      ).toLocaleString("en-IN")}
                    </div>
                    {c.paymentStatus === "pending" && c.paidAmount > 0 && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          marginTop: 2,
                          fontWeight: 500,
                        }}
                      >
                        (Total: ₹{(c.amount || 0).toLocaleString("en-IN")})
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      className={`badge badge-${c.restaurantType === "juice-shop" ? "juice" : c.restaurantType}`}
                    >
                      {RESTAURANT_LABELS[c.restaurantType] || c.restaurantType}
                    </span>
                  </td>
                  <td>
                    {c.productType && (
                      <span
                        className="badge"
                        style={{
                          background: "var(--bg-secondary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        {c.productType
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </span>
                    )}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {c.nextCallDate ? (
                      <span>
                        {new Date(c.nextCallDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {c.nextCallDate.includes("T") &&
                          !c.nextCallDate.endsWith("T00:00") && (
                            <span
                              style={{
                                display: "block",
                                color: "#60a5fa",
                                fontSize: 11,
                              }}
                            >
                              ⏰{" "}
                              {new Date(c.nextCallDate).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </span>
                          )}
                      </span>
                    ) : (
                      <span style={{ opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: 13,
                      maxWidth: 200,
                    }}
                  >
                    {c.callNotes ? (
                      <span
                        title={c.callNotes}
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: 180,
                        }}
                      >
                        {c.callNotes}
                      </span>
                    ) : (
                      <span style={{ opacity: 0.4 }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="cc-action-btn btn-whatsapp-solid"
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(c.whatsapp);
                        }}
                      >
                        <MessageCircle size={14} />
                      </button>
                      <button
                        className="cc-action-btn btn-edit-solid"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(c);
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="cc-action-btn btn-edit-solid"
                        style={{ color: "var(--accent-red)" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(c);
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CustomerDetailModal
        customer={viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        onEdit={(c) => {
          setViewingCustomer(null);
          handleEdit(c);
        }}
      />

      <CustomerModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        customer={editingCustomer}
      />

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => {
          handleDeleteConfirm();
          setConfirmOpen(false);
        }}
        title="Delete Customer"
      />
    </>
  );
}
