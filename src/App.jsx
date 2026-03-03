import { useState, useCallback, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import Reminders from "./pages/Reminders";
import CustomerModal from "./components/CustomerModal";
import {
  getCustomers,
  addCustomer,
  subscribe,
  hydrate,
  forceHydrate,
} from "./store/customerStore";

function classifyOverdue(dateStr) {
  if (!dateStr) return false;
  const now = new Date();
  const callDate = new Date(dateStr);
  return callDate < now;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsub = subscribe(() => setRefreshKey((k) => k + 1));
    return unsub;
  }, []);

  useEffect(() => {
    hydrate();
  }, []);

  const pendingCount = getCustomers().filter(
    (c) => c.paymentStatus === "pending" && c.status !== "not-interested",
  ).length;

  // Missed = past their scheduled call time/date right now (not just day)
  const missedCount = getCustomers().filter(
    (c) => c.nextCallDate && classifyOverdue(c.nextCallDate),
  ).length;

  // Reminder badge: today's calls (not overdue — those show in Missed)
  const reminderCount = getCustomers().filter((c) => {
    if (!c.nextCallDate) return false;
    const now = new Date();
    const callDate = new Date(c.nextCallDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    return callDate >= now && callDate <= todayEnd; // upcoming today only
  }).length;

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  async function handleRefresh() {
    await forceHydrate();
  }

  function handleAddFromSidebar(data) {
    addCustomer(data);
    showToast("Customer added successfully", "success");
    setAddModalOpen(false);
    navigate("/customers");
  }

  useEffect(() => {
    if (location.pathname === "/customers/new") setAddModalOpen(true);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
        reminderCount={reminderCount}
        missedCount={missedCount}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                onMenuClick={() => setSidebarOpen(true)}
                onRefresh={handleRefresh}
              />
            }
          />
          <Route
            path="/customers"
            element={
              <Customers
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
                onRefresh={handleRefresh}
              />
            }
          />
          <Route
            path="/customers/new"
            element={
              <Customers
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
                onRefresh={handleRefresh}
              />
            }
          />
          <Route
            path="/reminders"
            element={
              <Reminders
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
                preFilter="all"
                onRefresh={handleRefresh}
              />
            }
          />
          <Route
            path="/missed"
            element={
              <Reminders
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
                preFilter="overdue"
                onRefresh={handleRefresh}
              />
            }
          />
        </Routes>
      </main>

      <CustomerModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          navigate("/customers");
        }}
        onSave={handleAddFromSidebar}
        customer={null}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
