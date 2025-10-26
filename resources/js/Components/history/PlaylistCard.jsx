import React from "react";
import "../../../css/history.css";
import {router} from "@inertiajs/react";
import {Heart, HeartOff} from "lucide-react";
import {useState} from "react";

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

export default function PlaylistCard({ id, name, songs, date, emotion, image }) {
    const [isFavorite, setIsFavorite] = useState(false);

    const toggleFavorite = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        // agregar lógica para guardarlo en el backend
    }
    return (
        <div
            className="playlist-card bg-cover"
            style={{ backgroundImage: `url(${image})` }}
            onClick={() =>
                router.visit(route('emotion.playlists.show', { id: id }))
            }
        >
            <button
                onClick={toggleFavorite}
                className={`playlist-fav-btn ${isFavorite ? "active" : ""}`}
                title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            >
                <Heart size={20} />
            </button>
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
