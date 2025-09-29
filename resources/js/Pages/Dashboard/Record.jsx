import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import EmotionSummary from "../../Components/history/EmotionSummary.jsx";
import { Link } from "@inertiajs/react";

export default function Record({ playlists = [], summaryData = [], pagination = {} }) {
    const totalPages = pagination.total && pagination.per_page
        ? Math.ceil(pagination.total / pagination.per_page)
        : 1;

    return (
        <DashboardLayout>
            <div className="history-body">
                <div className="history-playlists-column">
                    <div className="history-playlists">
                        {playlists.map((pl, idx) => (
                            <PlaylistCard key={idx} {...pl} />
                        ))}
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
