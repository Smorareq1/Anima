import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/playlistView.css";

export default function PlaylistCarousel({ tracks }) {
    const sliderRef = useRef(null);
    const [slidesToShow, setSlidesToShow] = useState(3); // valor inicial seguro

    // 🔥 Detectar ancho real y ajustar slidesToShow antes del primer render
    useEffect(() => {
        const updateSlides = () => {
            const w = window.innerWidth;
            if (w <= 768) setSlidesToShow(1);
            else if (w <= 1024) setSlidesToShow(2);
            else setSlidesToShow(3);
        };
        updateSlides();
        window.addEventListener("resize", updateSlides);

        // Forzar cálculo después del montaje (corrige bug inicial)
        const timeout = setTimeout(() => {
            window.dispatchEvent(new Event("resize"));
            sliderRef.current?.innerSlider?.onWindowResized();
        }, 300);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener("resize", updateSlides);
        };
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        centerMode: false,
        centerPadding: "0px",
        swipeToSlide: false,
    };

    if (!tracks || tracks.length === 0) {
        return <p className="no-tracks">No hay canciones para mostrar.</p>;
    }

    return (
        <div className="carousel-wrapper">
            {/* 👇 el key fuerza re-montaje al cambiar slidesToShow */}
            <Slider key={`slider-${slidesToShow}`} ref={sliderRef} {...settings}>
                {tracks.map((track) => (
                    <div key={track.id} className="carousel-slide">
                        <div className="track-card">
                            <img
                                src={track.image_url ?? track.image}
                                alt={track.name}
                                className="track-cover"
                            />
                            <div className="track-content">
                                <h3 className="track-name">{track.name}</h3>
                                <p className="track-artist">{track.artist}</p>
                                <a
                                    href={track.spotify_url ?? track.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="track-link"
                                >
                                    Escuchar en Spotify
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
}
