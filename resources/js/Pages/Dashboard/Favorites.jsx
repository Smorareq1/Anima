import React, { useRef, useState, useEffect } from "react";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import "../../../css/favorites.css";
import PlaylistCard from "../../components/history/PlaylistCard.jsx";

export default function Favorites({ favoritosData }) {
    const { playlistsFavoritas, cancionesFavoritas } = favoritosData;
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
        <DashboardLayout>
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
                            {playlistsFavoritas.map((pl, idx) => (
                                <PlaylistCard
                                    key={idx}
                                    {...pl}
                                    showFavoriteIcon={false}
                                />
                            ))}
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
                        {cancionesFavoritas.map((c) => (
                            <li key={c.id} className="favorites-song-item">
                                <div className="favorites-song-left">
                                    <img
                                        src={c.imagen}
                                        alt={c.titulo}
                                        className="favorites-song-cover"
                                    />
                                    <div>
                                        <p className="favorites-song-title">
                                            {c.titulo}
                                        </p>
                                    </div>
                                </div>
                                <p className="favorites-song-artist">
                                    {c.artista}
                                </p>
                                <p className="favorites-song-album">{c.album}</p>
                                <p className="favorites-song-duration">
                                    {c.duracion}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </DashboardLayout>
    );
}
