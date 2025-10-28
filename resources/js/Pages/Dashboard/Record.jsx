import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import EmotionSummary from "../../Components/history/EmotionSummary.jsx";
import {Link, router} from "@inertiajs/react";

export default function Record({ playlists = [], summaryData = [], pagination = {} }) {
    const totalPages = pagination.total && pagination.per_page
        ? Math.ceil(pagination.total / pagination.per_page)
        : 1;

    return (
        <DashboardLayout title={"Historial - Anima"}>
            <div className="history-body">
                <div className="history-playlists-column">
                    <div className="history-playlists">
                        {playlists.length > 0 ? (
                            playlists.map((pl, idx) => (
                                <PlaylistCard key={idx} {...pl} />
                            ))
                        ) : (
                            <div className="no-history-wrapper">
                                <p className="no-history-text">
                                    Aún no tienes historial de playlists. {" "}
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
