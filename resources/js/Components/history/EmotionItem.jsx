import React from "react";
import "../../../css/history.css";
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

export default function EmotionSummaryItem({ emotion, playlists, songs }) {
    return (
        <div className="emotion-summary-item">
            <div className="emotion-icon">{emotionIcons[emotion] || "🎵"}</div>
            <div className="emotion-info">
                <strong>{playlists} playlists</strong>
                <br />
                +{songs} canciones
                <br />
                {emotionTranslations[emotion] || emotion}
            </div>
        </div>
    );
}
