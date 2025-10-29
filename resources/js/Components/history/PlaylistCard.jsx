import React from "react";
import "../../../css/history.css";
import {router} from "@inertiajs/react";
import {Heart} from "lucide-react";
import {useState} from "react";
import axios from "axios";

const emotionTranslations = {
    HAPPY: "FELIZ",
    SAD: "TRISTE",
    ANGRY: "ENOJADO",
    CALM: "CALMADO",
    SURPRISED: "SORPRENDIDO",
    CONFUSED: "CONFUNDIDO",
    DISGUSTED: "DISGUSTADO",
    FEAR: "MIEDO"
};

const emotionIcons = {
    HAPPY: "😊",
    SAD: "😢",
    ANGRY: "😡",
    CONFUSED: "😕",
    DISGUSTED: "🤢",
    SURPRISED: "😲",
    CALM: "😌",
    UNKNOWN: "❓",
    FEAR: "😨",
};

export default function PlaylistCard({ id, name, songs, date, emotion, image, isInitiallyFavorite, showFavoriteIcon = true }) {
    const [isFavorite, setIsFavorite] = useState(isInitiallyFavorite);

    const toggleFavorite = (e) => {
        e.stopPropagation();

        axios.post(route('favorites.toggle'), { playlist_id: id })
            .then(response => {
                if (response.data.status === 'added') {
                    setIsFavorite(true);
                } else if (response.data.status === 'removed') {
                    setIsFavorite(false);
                }
            })
            .catch(error => {
                console.error('Error toggling favorite:', error);
            });
    }

    return (
        <div
            className="playlist-card bg-cover"
            style={{ backgroundImage: `url(${image})` }}
            onClick={() =>
                router.visit(route('emotion.playlists.show', { id: id }))
            }
        >
            {showFavoriteIcon && (
                <button
                    onClick={toggleFavorite}
                    className={`playlist-fav-btn ${isFavorite ? "active" : ""}`}
                    title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
                >
                    <Heart size={20} />
                </button>
            )}
            <div className="playlist-overlay">
                <div className="playlist-info">
                    <h3>{name}</h3>
                    <p>{songs} canciones</p>
                    <p className="playlist-date">Recomendada el {date}</p>
                    <span className="playlist-emotion">
                        {emotionIcons[emotion] || "🎵"} {emotionTranslations[emotion] || emotion}
                    </span>
                </div>
            </div>
        </div>
    );
}
