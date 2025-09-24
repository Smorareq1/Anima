import "../../css/dashboard.css";
import Sidebar from "../Components/Sidebar.jsx";
import Topbar from "../Components/Topbar.jsx";

export default function DashboardLayout({children}) {
    return (
        <div className="dashboard-container">
            <aside className="dashboard-sidebar">
                <Sidebar />
            </aside>

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    {/*<Topbar />*/}
                </header>

                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
