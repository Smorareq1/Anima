import React, { useRef, useState, useEffect } from "react";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { usePage } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import PlaylistModal from "../../Components/modal/PlaylistModal.jsx";
import CompleteProfileModal from "../../Components/modal/CompleteProfileModal.jsx";
import "../../../css/homeDashboard.css"

export default function HomeDashboard({ recientesData }) {
    const { auth, playlistData, mustCompleteProfile } = usePage().props;
    const user = auth.user;

    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [localPlaylistData, setLocalPlaylistData] = useState(null);

    const { ultimasCanciones, ultimasPlaylists } = recientesData;

    // Detectar si hay datos nuevos para abrir el modal
    useEffect(() => {
        if (playlistData) {
            setLocalPlaylistData(playlistData);
            setIsPlaylistModalOpen(true);
        }
    }, [playlistData]);

    const closePlaylistModal = () => {
        setIsPlaylistModalOpen(false);
        setLocalPlaylistData(null);
    };

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    };

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) {
            el.addEventListener("scroll", checkScroll);
            window.addEventListener("resize", checkScroll);
        }
        return () => {
            if (el) el.removeEventListener("scroll", checkScroll);
            window.removeEventListener("resize", checkScroll);
        };
    }, [ultimasPlaylists]);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const cardWidth = 200;
        const gap = 20;
        const scrollAmount = cardWidth + gap;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    // Si se debe completar el perfil, solo se muestra ese modal
    if (mustCompleteProfile) {
        return (
            <DashboardLayout>
                <CompleteProfileModal isOpen={true} user={user} />
            </DashboardLayout>
        );
    }

    // --- Vista principal del Home Dashboard ---
    return (
        <DashboardLayout title={"Inicio - Anima"}>
            <div className="home-container">
                <div className="home-header">
                    <h2 className="home-title">
                        Bienvenido, {user.first_name || user.username}
                    </h2>
                    <h2 className="home-subtitle">
                        Tus últimas playlists analizadas
                    </h2>
                </div>

                <section className="home-section">
                    <div className="home-carousel-wrapper">
                        {canScrollLeft && (
                            <button
                                className="home-scroll-btn left"
                                onClick={() => scroll("left")}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <div className="home-playlist-row" ref={scrollRef}>
                            {ultimasPlaylists && ultimasPlaylists.length > 0 ? (
                                ultimasPlaylists.map((pl, idx) => (
                                    <PlaylistCard
                                        key={idx}
                                        {...pl}
                                        showFavoriteIcon={false}
                                    />
                                ))
                            ) : (
                                <div className="home-empty">
                                    <p className="no-home-text">No hay playlists recientes.</p>
                                </div>
                            )}
                        </div>

                        {canScrollRight && (
                            <button
                                className="home-scroll-btn right"
                                onClick={() => scroll("right")}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </section>

                <section className="home-section">
                    <h3 className='home-subtitle'>Tus últimas canciones recomendadas</h3>
                    <ul className="home-song-list">
                        {ultimasCanciones.length > 0 ? (
                            ultimasCanciones.map((c) => (
                                <li key={c.id} className="home-song-item">
                                    <div className="home-song-left">
                                        <img
                                            src={c.imagen}
                                            alt={c.titulo}
                                            className="home-song-cover"
                                        />
                                        <div>
                                            <p className="home-song-title">{c.titulo}</p>
                                        </div>
                                    </div>
                                    <p className="home-song-artist">{c.artista}</p>
                                    <p className="home-song-album">{c.album}</p>
                                    <p className="home-song-duration">{c.duracion}</p>
                                </li>
                            ))
                        ) : (
                            <p className="no-home-text">No tienes canciones favoritas todavía.</p>
                        )}
                    </ul>
                </section>

                {/* Modal que se abre al obtener una playlist nueva */}
                {localPlaylistData && (
                    <PlaylistModal
                        isOpen={isPlaylistModalOpen}
                        onClose={closePlaylistModal}
                        playlistData={localPlaylistData}
                    />
                )}
            </div>
        </DashboardLayout>
    );
}
