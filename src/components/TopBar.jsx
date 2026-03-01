export default function TopBar({ title, subtitle, children }) {
    return (
        <div className="topbar">
            <div className="topbar-left">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
            <div>
                {children}
            </div>
        </div>
    );
}
