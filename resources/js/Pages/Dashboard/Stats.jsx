import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import "../../../css/stats.css";
import { Head } from "@inertiajs/react";

export default function Stats({ statsData }) {
    const d = statsData;
    const COLORS = ["#00C49F", "#FF6B6B"];

    return (
        <DashboardLayout title="Tus estadísticas | Ánima">
            <h2 className="stats-title">Tus estadísticas</h2>

            <div className="stats-container">
                {/* === Emociones por semana === */}
                <section className="stats-card full-width">
                    <h3 className="stats-card-title">Emociones por semana</h3>
                    <div className="stats-chart-container">
                        <ResponsiveContainer>
                            <BarChart
                                data={d.totalesEmociones}
                                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="nombre" tick={{ fill: "#001e1d", fontSize: 12 }} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="cantidad" fill="#1D6363" radius={[6, 6, 0, 0]} />
                            </BarChart>

                        </ResponsiveContainer>
                    </div>
                </section>


                {/* === SEGUNDO BLOQUE: dos tarjetas lado a lado === */}
                <div className="stats-grid">
                    <section className="stats-card">
                        <h3 className="stats-card-title">Análisis por día</h3>
                        <div className="stats-chart-container">
                            <ResponsiveContainer>
                                <BarChart
                                    data={d.analisisPorDia}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="dia" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="cantidad" fill="#1D6363" name="Análisis" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <section className="stats-card">
                        <h3 className="stats-card-title">Positivas vs Negativas</h3>
                        <div className="stats-chart-container">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={d.positivasVsNegativas}
                                        dataKey="valor"
                                        nameKey="tipo"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >
                                        {d.positivasVsNegativas.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>

                {/* === TERCER BLOQUE: Últimas emociones === */}
                <section className="stats-card full-width">
                    <h3 className="stats-card-title">Últimas emociones detectadas</h3>
                    <div className="stats-summary-grid">
                        {d.ultimasEmociones.map((emo, idx) => (
                            <div key={idx} className="stats-summary-item">
                                <div className="stats-summary-icon">{emo.icono}</div>
                                <p className="stats-summary-label">{emo.fecha}</p>
                                <p className="stats-song-artist">{emo.nombre}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
