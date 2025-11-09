import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import EmotionSummary from "../../Components/history/EmotionSummary.jsx";
import {Link, router} from "@inertiajs/react";
import React from "react";

const handleFilterChange = (emotion) => {
    if (emotion === "") {
        router.visit(route("Record")); // sin filtro (todas)
    } else {
        router.visit(route("Record", { emotion })); // con filtro
    }
};


export default function Record({ playlists = [], summaryData = [], pagination = {}, currentEmotion }) {
    const totalPages = pagination.total && pagination.per_page
        ? Math.ceil(pagination.total / pagination.per_page)
        : 1;

    return (
        <DashboardLayout title={"Historial - Anima"}>
            <div className="history-body">
                <div className="history-playlists-column">
                    <header className="dashboard-header">
                        <h2 className="history-title">Tu historial de playlists</h2>
                        <select className="emotion-filter"
                                value={currentEmotion ?? ""}
                                onChange={(e) => handleFilterChange(e.target.value)}>
                            <option value=''>Todas las emociones</option>
                            <option value='HAPPY'>Feliz</option>
                            <option value='SAD'>Triste</option>
                            <option value='ANGRY'>Enojado</option>
                            <option value='CALM'>Calmado</option>
                            <option value='SURPRISED'>Sorprendido</option>
                            <option value='CONFUSED'>Confundido</option>
                            <option value='DISGUSTED'>Disgustado</option>
                            <option value='FEAR'>Miedo</option>
                        </select>
                    </header>
                    <div className="history-playlists">
                        {playlists.length > 0 ? (
                            playlists.map((pl, idx) => (
                                <PlaylistCard key={idx} {...pl} />
                            ))
                        ) : (
                            <div className="no-history-wrapper">
                                <p className="no-history-text">
                                    No se han encontrado playlists.{" "}
                                    <br/>
                                    <span
                                        className="no-history-redirect"
                                        onClick={() => router.visit(route("recommend"))}
                                    >
                                      ¡Comienza ahora!
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="pagination">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Link
                                key={i}
                                href={`?page=${i + 1}`}
                                className={pagination.current_page === i + 1 ? "active" : ""}
                            >
                                {i + 1}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="history-summary-column">
                    <EmotionSummary summaryData={summaryData} />
                </div>
            </div>
        </DashboardLayout>
    );
}
