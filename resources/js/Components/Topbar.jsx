
export default function Topbar({ onToggleSidebar }) {
    return (
        <div className="dashboard-topbar">
            <button className="sidebar-toggle" onClick={onToggleSidebar}>
                ☰
            </button>
        </div>
    );
}
