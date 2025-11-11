import React from "react";
import {useState} from "react";

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
import {ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ChevronDownIcon} from "lucide-react";
import { router } from "@inertiajs/react";

// Mapeo
const EMOCIONES_MAP = {
    HAPPY: "FELIZ",
    SAD: "TRISTE",
    ANGRY: "ENOJADO",
    CALM: "CALMADO",
    SURPRISED: "SORPRENDIDO",
    CONFUSED: "CONFUNDIDO",
    DISGUSTED: "DISGUSTADO",
    FEAR: "MIEDO",
};

// tooltip
const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
        const data = payload[0].payload;

        // traducción
        const emocionesTraducidas = data.emociones?.map(
            (emo) => EMOCIONES_MAP[emo] || emo
        );

        return (
            <div
                style={{
                    background: "#ffffff",
                    border: "1px solid #CDE8C9",
                    borderRadius: "8px",
                    padding: "0.6rem 0.8rem",
                    fontSize: "0.85rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontWeight: 600,
                        color: data.tipo === "Positivas" ? "#00C49F" : "#FF6B6B",
                    }}
                >
                    {data.tipo}: {data.valor}
                </p>
                <ul
                    style={{
                        margin: "0.4rem 0 0 0.8rem",
                        padding: 0,
                        listStyle: "disc",
                        color: "#333",
                    }}
                >
                    {emocionesTraducidas?.map((emo, idx) => (
                        <li key={idx}>{emo}</li>
                    ))}
                </ul>
            </div>
        );
    }
    return null;
};

export default function Stats({ statsData }) {
    const d = statsData;
    const [semanaIndex, setSemanaIndex] = React.useState(
        d.emocionesPorSemana.length - 1 // por defecto será la más reciente
    );

    const semanaActual = d.emocionesPorSemana[semanaIndex];

    const handlePrevWeek = () => {
        if (semanaIndex > 0) setSemanaIndex(semanaIndex - 1);
    };

    const handleNextWeek = () => {
        if (semanaIndex < d.emocionesPorSemana.length - 1)
            setSemanaIndex(semanaIndex + 1);
    };
    const [selectedEmotion, setSelectedEmotion] = React.useState(null);
    const [playlists, setPlaylists] = React.useState([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [selectedDate, setSelectedDate] = React.useState(null);
    const [dayEmotions, setDayEmotions] = React.useState([]);
    const [isDayModalOpen, setIsDayModalOpen] = React.useState(false);

    const [expandedEmotion, setExpandedEmotion] = React.useState(null);
    const [dayPlaylists, setDayPlaylists] = React.useState({});

    const handleDayBarClick = async (data) => {
        const fecha = data.dia;
        try {
            const response = await fetch(
                route("stats.emotionsByDay") + `?fecha=${fecha}`,
                { headers: { Accept: "application/json" } }
            );

            if (!response.ok) throw new Error("Error al cargar emociones");

            const emociones = await response.json();
            setDayEmotions(emociones);
            setSelectedDate(fecha);
            setIsDayModalOpen(true);
        } catch (error) {
            console.error("Error cargando emociones:", error);
        }
    };

    const toggleEmotionExpand = async (emo) => {
        const isExpanded = expandedEmotion === emo.emocion;
        if (isExpanded) {
            setExpandedEmotion(null);
            return;
        }

        setExpandedEmotion(emo.emocion);

        // Si ya tenemos esas playlists cargadas, no se piden nuevamente
        if (dayPlaylists[emo.emocion]) return;

        try {
            const response = await fetch(
                route("stats.playlistsByDay") +
                `?fecha=${selectedDate}&emotion=${emo.emocion}`,
                { headers: { Accept: "application/json" } }
            );

            if (!response.ok) throw new Error("Error al cargar playlists");
            const data = await response.json();

            setDayPlaylists((prev) => ({
                ...prev,
                [emo.emocion]: data,
            }));
        } catch (error) {
            console.error("Error cargando playlists del día:", error);
        }
    };


    const handleBarClick = async (data) => {
        const emotion = data.keyOriginal;
        const semana = semanaActual?.semana;

        if (!emotion || !semana) return;

        // extraer fechas
        const partes = semana.split(/[-–]/).map(p => p.trim()).filter(Boolean);

        if (partes.length < 2) {
            console.warn("Semana no tiene rango válido:", semana);
            return;
        }

        const currentYear = new Date().getFullYear();
        const inicio = `${partes[0]} ${currentYear}`;
        const fin = `${partes[1]} ${currentYear}`;

        try {
            const response = await fetch(
                route('stats.playlists') +
                `?emotion=${emotion.toUpperCase()}&inicio=${inicio}&fin=${fin}`
            );
            const data = await response.json();
            setPlaylists(data);
            setSelectedEmotion(emotion);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error cargando playlists:", error);
        }
    };

    const COLORS = ["#00C49F", "#FF6B6B"];

    return (
        <DashboardLayout title="Tus estadísticas | Ánima">
            <h2 className="stats-title">Tus estadísticas</h2>

            <div className="stats-container">
                {/* === Emociones por semana === */}
                <section className="stats-card full-width">
                    <div className="stats-header">
                        <h3 className="stats-card-title">Emociones por semana</h3>
                        <div className="stats-nav">
                            <button
                                onClick={handlePrevWeek}
                                disabled={semanaIndex === 0}
                                className="stats-arrow"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="stats-week-label">
                                {semanaActual?.semana || "Sin datos"}
                            </span>
                            <button
                                onClick={handleNextWeek}
                                disabled={
                                    semanaIndex === d.emocionesPorSemana.length - 1
                                }
                                className="stats-arrow"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="stats-chart-container">
                        {semanaActual ? (
                            <ResponsiveContainer>
                                <BarChart
                                    data={Object.entries(semanaActual)
                                        .filter(([key]) => key !== "semana")
                                        .map(([key, value]) => ({
                                            keyOriginal: key.toUpperCase(), //ingles
                                            nombre: EMOCIONES_MAP[key.toUpperCase()] || key.toUpperCase(), //esp
                                            cantidad: value,
                                        }))}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey = "nombre"
                                        tick={{ fill: "#001e1d", fontSize: 12 }}
                                    />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="cantidad"
                                        fill="#1D6363"
                                        radius={[6, 6, 0, 0]}
                                        onClick={(data) => handleBarClick(data)}
                                        cursor="pointer"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p style={{ color: "#777" }}>No hay datos para esta semana.</p>
                        )}
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
                                    <Bar
                                        dataKey="cantidad"
                                        fill="#1D6363"
                                        radius={[6, 6, 0, 0]}
                                        cursor="pointer"
                                        onClick={(data) => handleDayBarClick(data)}
                                    />
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
                                                fill={index === 0 ? "#00C49F" : "#FF6B6B"}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
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
                        {d.ultimasEmociones.map((emo) => (
                            <div key={emo.id} className="stats-summary-item" onClick={ () =>router.visit(route("emotion.playlists.show", emo.id))}>
                                <div className="stats-summary-icon">{emo.icono}</div>
                                <p className="stats-summary-label">{emo.fecha}</p>
                                <p className="stats-song-artist">{emo.nombre}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            Playlists de la emoción: {
                                EMOCIONES_MAP[selectedEmotion] || selectedEmotion
                        } ({semanaActual?.semana})
                        </h3>

                        {playlists.length > 0 ? (
                            <ul className="modal-playlist-list">
                                {playlists.map((pl) => (
                                    <li key={pl.id} className="modal-playlist-item">
                                        <img
                                            src={
                                                pl.playlist_image?.startsWith("http")
                                                    ? pl.playlist_image
                                                    : `/storage/${pl.playlist_image}`
                                            }
                                            alt={pl.name}
                                            className="modal-playlist-img"
                                        />
                                        <div className="modal-playlist-info">
                                            <p className="modal-playlist-name">{pl.name}</p>
                                            <p className="modal-playlist-date">
                                                {new Date(pl.created_at).toLocaleDateString("es-ES")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => router.visit(route("emotion.playlists.show", pl.id))}
                                            className="modal-link modal-detail-btn"
                                        >
                                            Ver detalle
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="modal-empty">No hay playlists para esta emoción.</p>
                        )}
                    </div>
                </div>
            )}
            {isDayModalOpen && (
                <div className="modal-overlay" onClick={() => setIsDayModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">
                            Emociones del {selectedDate}
                        </h3>

                        {dayEmotions.length > 0 ? (
                            <ul className="modal-emotions-list">
                                {dayEmotions.map((emo, idx) => (
                                    <li key={idx} className="modal-emotion-item">
                                        <div className="emotion-header">
                                            <div className="emotion-left">
                                                <span className="modal-emotion-icon">{emo.icono}</span>
                                                <span className="modal-emotion-name">{emo.nombre}</span>
                                                <span className="modal-emotion-count">
                                                    {emo.cantidad} registro{emo.cantidad !== 1 && "s"}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => toggleEmotionExpand(emo)}
                                                className={`chevron-btn ${
                                                    expandedEmotion === emo.emocion ? "rotated" : ""
                                                }`}
                                            >
                                                <ChevronDown size={20} />
                                            </button>
                                        </div>

                                        <div
                                            className={`emotion-playlists-wrapper ${
                                                expandedEmotion === emo.emocion ? "open" : ""
                                            }`}
                                        >
                                            <div className="emotion-playlists">
                                                {dayPlaylists[emo.emocion] ? (
                                                    dayPlaylists[emo.emocion].length > 0 ? (
                                                        <ul className="playlist-sublist">
                                                            {dayPlaylists[emo.emocion].map((pl) => (
                                                                <li
                                                                    key={pl.id}
                                                                    className="playlist-subitem"
                                                                    onClick={() =>
                                                                        router.visit(route("emotion.playlists.show", pl.id))
                                                                    }
                                                                >
                                                                    <img
                                                                        src={
                                                                            pl.playlist_image?.startsWith("http")
                                                                                ? pl.playlist_image
                                                                                : `/storage/${pl.playlist_image}`
                                                                        }
                                                                        alt={pl.name}
                                                                        className="playlist-subimg"
                                                                    />
                                                                    <span className="playlist-subname">{pl.name}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="modal-empty">
                                                            No hay playlists para esta emoción.
                                                        </p>
                                                    )
                                                ) : (
                                                    <p className="modal-loading">Cargando...</p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="modal-empty">No hubo emociones detectadas ese día.</p>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
