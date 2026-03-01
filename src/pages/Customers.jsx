import { useState, useCallback } from 'react';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    MessageCircle,
    Users as UsersIcon,
} from 'lucide-react';
import TopBar from '../components/TopBar';
import CustomerModal from '../components/CustomerModal';
import ConfirmDialog from '../components/ConfirmDialog';
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
} from '../store/customerStore';

const RESTAURANT_LABELS = {
    cafe: '☕ Cafe',
    'juice-shop': '🥤 Juice Shop',
    hotel: '🏨 Hotel',
};

export default function Customers({ onMenuClick, onDataChange, showToast }) {
    const [customers, setCustomers] = useState(getCustomers);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const refresh = useCallback(() => {
        setCustomers(getCustomers());
        onDataChange?.();
    }, [onDataChange]);

    // Filter
    const filtered = customers.filter(c => {
        const matchSearch =
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.whatsapp.includes(search) ||
            c.location.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        const matchPayment = filterPayment === 'all' || c.paymentStatus === filterPayment;
        const matchType = filterType === 'all' || c.restaurantType === filterType;
        return matchSearch && matchStatus && matchPayment && matchType;
    });

    function handleSave(data) {
        if (editingCustomer) {
            updateCustomer(editingCustomer.id, data);
            showToast('Customer updated successfully', 'success');
        } else {
            addCustomer(data);
            showToast('Customer added successfully', 'success');
        }
        setModalOpen(false);
        setEditingCustomer(null);
        refresh();
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
            showToast('Customer deleted', 'success');
            refresh();
        }
        setConfirmOpen(false);
        setDeleteTarget(null);
    }

    function openWhatsApp(number) {
        const cleaned = number.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleaned}`, '_blank');
    }

    return (
        <>
            <TopBar
                title="Customers"
                subtitle={`${filtered.length} of ${customers.length} customers`}
                onMenuClick={onMenuClick}
            >
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingCustomer(null);
                        setModalOpen(true);
                    }}
                >
                    <Plus size={16} />
                    Add Customer
                </button>
            </TopBar>

            <div className="page-content">
                {/* Filters */}
                <div className="filter-bar" style={{ marginBottom: 22 }}>
                    <div className="search-input-wrapper">
                        <Search />
                        <input
                            className="form-input"
                            placeholder="Search by name, number, or location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{ width: 130 }}
                    >
                        <option value="all">All Status</option>
                        <option value="hot">🔥 Hot</option>
                        <option value="warm">🌡️ Warm</option>
                    </select>
                    <select
                        className="form-select"
                        value={filterPayment}
                        onChange={e => setFilterPayment(e.target.value)}
                        style={{ width: 150 }}
                    >
                        <option value="all">All Payment</option>
                        <option value="paid">✅ Paid</option>
                        <option value="pending">⏳ Pending</option>
                    </select>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        style={{ width: 150 }}
                    >
                        <option value="all">All Types</option>
                        <option value="cafe">☕ Cafe</option>
                        <option value="juice-shop">🥤 Juice Shop</option>
                        <option value="hotel">🏨 Hotel</option>
                    </select>
                </div>

                {/* Table */}
                <div className="card">
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>WhatsApp</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Amount</th>
                                    <th>Location</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length > 0 ? (
                                    filtered.map(c => (
                                        <tr key={c.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div
                                                        style={{
                                                            width: 34,
                                                            height: 34,
                                                            borderRadius: '50%',
                                                            background: 'var(--accent-primary-soft)',
                                                            color: 'var(--accent-primary)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 700,
                                                            fontSize: 13,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {c.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600 }}>{c.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{c.whatsapp}</td>
                                            <td>
                                                <span className={`badge badge-${c.status}`}>
                                                    <span className="badge-dot" />
                                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${c.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                                                    <span className="badge-dot" />
                                                    {c.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                ₹{(c.amount || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td style={{ color: 'var(--text-secondary)' }}>{c.location}</td>
                                            <td>
                                                <span
                                                    className={`badge badge-${c.restaurantType === 'juice-shop' ? 'juice' : c.restaurantType}`}
                                                >
                                                    {RESTAURANT_LABELS[c.restaurantType] || c.restaurantType}
                                                </span>
                                            </td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                                                {new Date(c.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="btn-whatsapp"
                                                        title="WhatsApp"
                                                        onClick={() => openWhatsApp(c.whatsapp)}
                                                    >
                                                        <MessageCircle />
                                                    </button>
                                                    <button
                                                        className="btn-edit"
                                                        title="Edit"
                                                        onClick={() => handleEdit(c)}
                                                    >
                                                        <Edit2 />
                                                    </button>
                                                    <button
                                                        className="btn-delete"
                                                        title="Delete"
                                                        onClick={() => handleDeleteClick(c)}
                                                    >
                                                        <Trash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9}>
                                            <div className="empty-state">
                                                <UsersIcon size={48} />
                                                <h4>No customers found</h4>
                                                <p>
                                                    {customers.length === 0
                                                        ? 'Add your first customer to get started'
                                                        : 'Try adjusting your filters'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

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
                onConfirm={handleDeleteConfirm}
                title="Delete Customer"
                message={
                    deleteTarget
                        ? <>Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This cannot be undone.</>
                        : 'Are you sure?'
                }
            />
        </>
    );
}
