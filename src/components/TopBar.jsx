import { Menu } from 'lucide-react';

export default function TopBar({ title, subtitle, onMenuClick, children }) {
    return (
        <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button className="menu-toggle" onClick={onMenuClick}>
                    <Menu size={22} />
                </button>
                <div className="topbar-left">
                    <h2>{title}</h2>
                    {subtitle && <p>{subtitle}</p>}
                </div>
            </div>
            <div className="topbar-actions">
                {children}
            </div>
        </div>
    );
}
