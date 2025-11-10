import React, { useRef, useState, useEffect } from "react";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import "../../../css/favorites.css";
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";

export default function Favorites({ favoritosData }) {
    // Hacemos la desestructuración segura: si favoritosData no existe,
    // se usan arrays vacíos por defecto para evitar errores.
    const { playlistsFavoritas = [], cancionesFavoritas = [] } = favoritosData || {};

    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(
            el.scrollLeft < el.scrollWidth - el.clientWidth - 10
        );
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
    }, [playlistsFavoritas]);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const cardWidth = 200;
        const gap = 20;
        const scrollAmount = cardWidth + gap;

        if (direction === "left") {
            container.scrollBy({
                left: -scrollAmount,
                behavior: "smooth",
            });
        } else {
            container.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        }
    };


    return (
        <DashboardLayout title={"Favoritos - Anima"}>
            <div className="favorites-container">
                <div className="favorites-header">
                    <h2 className="favorites-title">
                        Revive lo que más te hizo sentir
                    </h2>
                </div>

                <section className="favorites-section">
                    <h3>Playlists</h3>
                    <div className="favorites-carousel-wrapper">
                        {canScrollLeft && (
                            <button
                                className="favorites-scroll-btn left"
                                onClick={() => scroll("left")}
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <div className="favorites-playlist-row" ref={scrollRef}>
                            {playlistsFavoritas.length > 0 ? (
                                playlistsFavoritas.map((pl, idx) => (
                                    <PlaylistCard
                                        key={idx}
                                        {...pl}
                                        showFavoriteIcon={false}
                                    />
                                ))
                            ) : (
                                <div className="no-favorites-wrapper">
                                    <p className="no-favorites-text">No tienes playlists favoritas todavía.</p>
                                </div>
                            )}
                        </div>

                        {canScrollRight && (
                            <button
                                className="favorites-scroll-btn right"
                                onClick={() => scroll("right")}
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </section>

                <section className="favorites-section">
                    <h3>Canciones</h3>
                    <ul className="favorites-song-list">
                        {cancionesFavoritas.length > 0 ? (
                            cancionesFavoritas.map((c) => (
                                <li key={c.id} className="favorites-song-item">
                                    <div className="favorites-song-left">
                                        <img
                                            src={c.imagen}
                                            alt={c.titulo}
                                            className="favorites-song-cover"
                                        />
                                        <div>
                                            <p className="favorites-song-title">{c.titulo}</p>
                                        </div>
                                    </div>
                                    <p className="favorites-song-artist">{c.artista}</p>
                                    <p className="favorites-song-album">{c.album}</p>
                                    <div className="favorites-song-right">
                                        <p className="favorites-song-duration">{c.duracion}</p>
                                        <button
                                            onClick={() => window.open(c.spotify_url, "_blank", "noopener,noreferrer")}
                                            className="spotify-play-btn"
                                        >
                                            Ir a Spotify
                                        </button>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="no-favorites-text">No tienes canciones favoritas todavía.</p>
                        )}
                    </ul>
                </section>
            </div>
        </DashboardLayout>
    );
}
