import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    X,
} from 'lucide-react';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/customers/new', icon: UserPlus, label: 'Add Customer' },
];

export default function Sidebar({ isOpen, onClose, pendingCount }) {
    const location = useLocation();

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <div className="sidebar-logo-icon">MT</div>
                        <div>
                            <h1>MenuThere</h1>
                            <span>CRM Dashboard</span>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-label">Main</div>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive =
                            item.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(item.path) && item.path !== '/';

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <Icon />
                                <span>{item.label}</span>
                                {item.label === 'Customers' && pendingCount > 0 && (
                                    <span className="nav-badge">{pendingCount}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Close button on mobile */}
                <button
                    className="modal-close"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: 'none',
                    }}
                >
                    <X size={18} />
                </button>
            </aside>
        </>
    );
}
