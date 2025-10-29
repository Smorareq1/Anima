import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import "../../../css/administrator.css";
import RecommendedSongs from "../../Components/RecommendedSongs.jsx";
import ChartCard from "../../Components/ChartCard.jsx";
import {Head} from "@inertiajs/react";

export default function Administrator({ dashboardData }) {
    const d = dashboardData;
    return (
        <DashboardLayout title={"Panel de Administrador | Anima"}>
            <h2 className={"admin-title"}>Panel de Administrador</h2>
            <div className="admin-container">

                {/* Sección Resumen */}
                <section className="admin-card admin-summary">
                    <h3 className="admin-card-title">Resumen</h3>
                    <div className="admin-summary-grid">
                        <div className="admin-summary-item">
                            <img
                                src={d.usuarioMasActivo.imagen}
                                alt="Usuario"
                                className="admin-summary-image"
                            />
                            <p className="admin-summary-label">Usuario más activo</p>
                            <p className="admin-song-artist">{d.usuarioMasActivo.nombre}</p>
                        </div>

                        <div className="admin-summary-item">
                            <img
                                src={d.cancionMasEscuchada.imagen}
                                alt="Canción"
                                className="admin-summary-image"
                            />
                            <p className="admin-summary-label">Canción más escuchada</p>
                            <p className="admin-song-artist">{d.cancionMasEscuchada.titulo} - {d.cancionMasEscuchada.artista}</p>
                        </div>

                        <div className="admin-summary-item">
                            <div className="admin-summary-icon">{d.emocionMasPopular.icono}</div>
                            <p className="admin-summary-label">Emoción más popular</p>
                            <p className="admin-song-artist">{d.emocionMasPopular.nombre}</p>
                        </div>
                    </div>
                </section>

                {/* Gráficas */}
                <section className="admin-charts-grid">
                    <RecommendedSongs songs={d.cancionesRecomendadas} />
                    <ChartCard title="Usuarios Activos" data={d.usuariosActivos} />
                    <ChartCard title="Emociones más populares" data={d.emocionesPopulares} />
                    <ChartCard title="Usuarios con Spotify" data={d.usuariosSpotify} />
                </section>
            </div>
        </DashboardLayout>
    );
}
