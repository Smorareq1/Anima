import React, { useRef, useState, useEffect } from "react";
import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../../../css/explore.css"
import PlaylistCard from "../../Components/history/PlaylistCard.jsx";
import playlistCarousel from "../PlaylistCarousel.jsx";
import PlaylistCarousel from "../PlaylistCarousel.jsx";

export default function Explore({ explorarData }) {
    const { playlistRecomendada, cancionesRecomendadas } = explorarData;
    const scrollRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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
    }, [playlistRecomendada]);

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

    return (
        <DashboardLayout title={"Explorar - Anima"}>
            <div className="explorar-container">
                <div className="explorar-header">
                    <h2 className="explorar-title">Explora nueva música</h2>
                    <p className="explorar-subtitle">
                        Descubrí música aleatoria que quizá no conocías.
                    </p>
                </div>

                <section className="favorites-section">

                    <div className="explorar-carousel">
                        {cancionesRecomendadas && cancionesRecomendadas.length > 0 ? (
                            <PlaylistCarousel tracks={cancionesRecomendadas} />
                        ) : (
                            <div className="no-explorar-wrapper">
                                <p className="no-explorar-text">
                                    No hay canciones disponibles en este momento.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
