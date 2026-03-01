import { useState, useEffect } from "react";
import { X } from "lucide-react";

const defaultForm = {
  name: "",
  whatsapp: "",
  status: "hot",
  paymentStatus: "pending",
  amount: "",
  location: "",
  restaurantType: "restaurant",
  productType: "petpooja",
};

export default function CustomerModal({ isOpen, onClose, onSave, customer }) {
  const [form, setForm] = useState(defaultForm);
  const isEdit = !!customer;

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        whatsapp: customer.whatsapp || "",
        status: customer.status || "hot",
        paymentStatus: customer.paymentStatus || "pending",
        amount: customer.amount || "",
        location: customer.location || "",
        restaurantType: customer.restaurantType || "restaurant",
        productType: customer.productType || "petpooja",
      });
    } else {
      setForm(defaultForm);
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
    onSave({
      ...form,
      amount: parseFloat(form.amount) || 0,
    });
    setForm(defaultForm);
  }

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
            <div className="form-group">
              <label className="form-label">Lead Status</label>
              <select
                className="form-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="hot">🔥 Hot</option>
                <option value="warm">🌡️ Warm</option>
              </select>
            </div>
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
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
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
