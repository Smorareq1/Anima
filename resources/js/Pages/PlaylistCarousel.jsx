import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../css/playlistView.css";

export default function PlaylistCarousel({ tracks }) {
    if (!tracks || tracks.length === 0) {
        return <p className="no-tracks">No hay canciones para mostrar.</p>;
    }


    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        swipeToSlide: true,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    centerMode: true,
                    centerPadding: "30px",
                    dots: true,
                    arrows: false,
                },
            },
        ],
    };


    return (
        <div className="carousel-wrapper">
            <Slider {...settings}>
                {tracks.map((track) => (
                    <div key={track.id} className="carousel-slide">
                        <div className="track-card">
                            <img
                                src={track.image}
                                alt={track.name}
                                className="track-cover"
                            />
                            <div className="track-content">
                                <h3 className="track-name">{track.name}</h3>
                                <p className="track-artist">{track.artist}</p>
                                <a
                                    href={track.url}
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
