import React from "react";
import "../../../css/history.css";

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

export default function PlaylistCard({ name, songs, date, emotion, image }) {
    return (
        <div
            className="playlist-card bg-cover"
            style={{ backgroundImage: `url(${image})` }}
        >
            <div className="playlist-overlay">
                <div className="playlist-info">
                    <h3>{name}</h3>
                    <p>{songs} canciones</p>
                    <p className="playlist-date">Recomendada el {date}</p>
                    <span className="playlist-emotion">
                        {emotionIcons[emotion] || "🎵"} {emotion}
                    </span>
                </div>
            </div>
        </div>
    );
}
