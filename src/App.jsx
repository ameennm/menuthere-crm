import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import CustomerModal from './components/CustomerModal';
import {
  getCustomers,
  addCustomer,
  subscribe,
  hydrate,
} from './store/customerStore';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Subscribe to store changes → auto-refresh UI
  useEffect(() => {
    const unsub = subscribe(() => {
      setRefreshKey(k => k + 1);
    });
    return unsub;
  }, []);

  // Hydrate from D1 on app start
  useEffect(() => {
    hydrate();
  }, []);

  const pendingCount = getCustomers().filter(c => c.paymentStatus === 'pending').length;

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Handle "Add Customer" from sidebar nav
  function handleAddFromSidebar(data) {
    addCustomer(data);
    showToast('Customer added successfully', 'success');
    setAddModalOpen(false);
    navigate('/customers');
  }

  // Intercept /customers/new route to open modal
  useEffect(() => {
    if (location.pathname === '/customers/new') {
      setAddModalOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                key={refreshKey}
                onMenuClick={() => setSidebarOpen(true)}
              />
            }
          />
          <Route
            path="/customers"
            element={
              <Customers
                key={refreshKey}
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
              />
            }
          />
          <Route
            path="/customers/new"
            element={
              <Customers
                key={refreshKey}
                onMenuClick={() => setSidebarOpen(true)}
                showToast={showToast}
              />
            }
          />
        </Routes>
      </main>

      {/* Modal for /customers/new route */}
      <CustomerModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          navigate('/customers');
        }}
        onSave={handleAddFromSidebar}
        customer={null}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
