import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus } from 'lucide-react';

export default function Sidebar({ pendingCount }) {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/customers', icon: Users, label: 'Customers' },
    ];

    return (
        <>
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="sidebar">
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
                    <div style={{ paddingLeft: 16, fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                        Main
                    </div>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path) && item.path !== '/';

                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`desktop-nav-link ${isActive ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                                {item.label === 'Customers' && pendingCount > 0 && (
                                    <span className="nav-badge">{pendingCount}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            {/* --- MOBILE BOTTOM NAV --- */}
            <nav className="bottom-nav">
                {navItems.map(item => {
                    const Icon = item.icon;
                    const isActive = item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path) && item.path !== '/';

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span>{item.label}</span>
                            {item.label === 'Customers' && pendingCount > 0 && (
                                <span className="nav-badge-float">{pendingCount}</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>
        </>
    );
}
