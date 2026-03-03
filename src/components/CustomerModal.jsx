import { useState, useEffect } from "react";
import { X } from "lucide-react";
import DateTimePicker from "./DateTimePicker";

function getDefaultForm() {
  // Default next call = today at 5:00 PM
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const defaultNextCall = `${yyyy}-${mm}-${dd}T17:00`;

  return {
    name: "",
    whatsapp: "",
    status: "hot",
    paymentStatus: "pending",
    amount: "10000",
    paidAmount: "",
    location: "",
    restaurantType: "restaurant",
    productType: "petpooja",
    nextCallDate: defaultNextCall,
    callNotes: "",
    notInterestedReason: "",
  };
}



export default function CustomerModal({ isOpen, onClose, onSave, customer }) {
  const [form, setForm] = useState(getDefaultForm);
  const isEdit = !!customer;

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        whatsapp: customer.whatsapp || "",
        status: customer.status || "hot",
        paymentStatus: customer.paymentStatus || "pending",
        amount: customer.amount || "",
        paidAmount: customer.paidAmount || "",
        location: customer.location || "",
        restaurantType: customer.restaurantType || "restaurant",
        productType: customer.productType || "petpooja",
        nextCallDate: customer.nextCallDate || "",
        callNotes: customer.callNotes || "",
        notInterestedReason: customer.notInterestedReason || "",
      });
    } else {
      setForm(getDefaultForm());
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.whatsapp.trim()) return;

    const tAmount = parseFloat(form.amount) || 0;
    const pAmount = parseFloat(form.paidAmount) || 0;

    // Auto-update payment status
    let payStatus = form.paymentStatus;
    if (pAmount >= tAmount && tAmount > 0) {
      payStatus = "paid";
    } else if (pAmount < tAmount && payStatus === "paid") {
      payStatus = "pending";
    }

    onSave({
      ...form,
      amount: tAmount,
      paidAmount: pAmount,
      paymentStatus: payStatus,
    });
    setForm(getDefaultForm());
  }

  const tAmount = parseFloat(form.amount) || 0;
  const pAmount = parseFloat(form.paidAmount) || 0;
  const pendingAmount = tAmount - pAmount;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{isEdit ? "Edit Customer" : "Add New Customer"}</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div className="form-grid" style={{ gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                className="form-input"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Number *</label>
              <input
                className="form-input"
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">📅 Next Call Date & Time</label>
              <DateTimePicker
                name="nextCallDate"
                value={form.nextCallDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">📝 What They Said / Call Notes</label>
              <textarea
                className="form-input"
                name="callNotes"
                value={form.callNotes}
                onChange={handleChange}
                placeholder="e.g. Interested but waiting for budget approval, callback in 2 weeks..."
                rows={3}
                style={{ resize: "vertical", minHeight: 72 }}
              />
            </div>
            <div className="form-group" style={{ gridColumn: form.status === "not-interested" ? "1 / -1" : undefined }}>
              <label className="form-label">Lead Status</label>
              <select
                className="form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌡️ Warm</option>
                <option value="not-interested">👎 Not Interested</option>
              </select>
            </div>
            {form.status === "not-interested" && (
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">🚫 Reason for Not Interested</label>
                <textarea
                  className="form-input"
                  name="notInterestedReason"
                  value={form.notInterestedReason}
                  onChange={handleChange}
                  placeholder="e.g. Already using a competitor, budget issues, no decision maker available..."
                  rows={3}
                  style={{
                    resize: "vertical",
                    minHeight: 72,
                    borderColor: "var(--accent-red)",
                    borderWidth: 1,
                  }}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                name="paymentStatus"
                value={form.paymentStatus}
                onChange={handleChange}
              >
                <option value="paid">✅ Paid</option>
                <option value="pending">⏳ Pending</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <label className="form-label">Total Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Paid Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  name="paidAmount"
                  value={form.paidAmount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="form-label">Pending Amount (₹)</label>
                <div style={{
                  padding: "9px 12px",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  color: pendingAmount > 0 ? "#fb923c" : pendingAmount < 0 ? "#34d399" : "var(--text-secondary)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  height: 40
                }}>
                  ₹{pendingAmount.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City or area"
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Restaurant Type</label>
              <select
                className="form-select"
                name="restaurantType"
                value={form.restaurantType}
                onChange={handleChange}
              >
                <option value="restaurant">🍽️ Restaurant (Default)</option>
                <option value="cafe">☕ Cafe</option>
                <option value="juice-shop">🥤 Juice Shop</option>
                <option value="hotel">🏨 Hotel</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">Product Type</label>
              <select
                className="form-select"
                name="productType"
                value={form.productType}
                onChange={handleChange}
              >
                <option value="petpooja">Petpooja (Default)</option>
                <option value="digital menu">Digital Menu</option>
                <option value="deliver/billing">Deliver / Billing</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {isEdit ? "Update Customer" : "Add Customer"}
          </button>
        </div>
      </form>
    </div>
  );
}
