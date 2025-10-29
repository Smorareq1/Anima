import "../../css/dashboard.css";
import Sidebar from "../Components/Sidebar.jsx";
import Topbar from "../Components/Topbar.jsx";
import React, {useState} from "react";
import {Head} from "@inertiajs/react";

export default function DashboardLayout({children, title}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="dashboard-container">
            <Head title={title || "Anima"} />
            <aside className={`dashboard-sidebar ${sidebarOpen ? "active" : ""}`}>
                <Sidebar />
            </aside>
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="dashboard-main">
                <header className="dashboard-topbar">
                    <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                </header>

                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
