import "../../css/dashboard.css";
import Sidebar from "../Components/Sidebar.jsx";
import Topbar from "../Components/Topbar.jsx";
import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import LoadingScreen from "../Components/LoadingScreen.jsx";

// Frases que se mostrarán durante la carga al navegar
const frasesNavegacion = [
    "Cambiando de ambiente...",
    "Preparando tu próxima experiencia...",
    "Viajando a la velocidad del sonido...",
    "Sintonizando nuevas vibras..."
];

export default function DashboardLayout({children, title}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsNavigating(true);
        const handleFinish = () => setIsNavigating(false);

        const unregisterStart = router.on('start', handleStart);
        const unregisterFinish = router.on('finish', handleFinish);

        return () => {
            // La forma correcta de desregistrar los eventos en Inertia
            // es llamar a la función que router.on() devuelve.
            unregisterStart();
            unregisterFinish();
        };
    }, []);

    return (
        <div className="dashboard-container">
            <Head title={title || "Anima"} />
            <LoadingScreen isLoading={isNavigating} phrases={frasesNavegacion} />
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
