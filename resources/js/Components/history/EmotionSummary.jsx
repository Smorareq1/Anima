import React from "react";
import EmotionItem from "./EmotionItem.jsx";
import "../../../css/history.css";

export default function EmotionSummary({ summaryData }) {
    return (
        <div className="emotion-summary">
            <div className="emotion-summary-header">
                <h3>Resumen</h3>
                <a href="#">Ver todo</a>
            </div>
            <div className="emotion-summary-list">
                {summaryData.map((item, index) => (
                    <EmotionItem
                        key={index}
                        emotion={item.emotion}
                        playlists={item.playlists}
                        songs={item.songs}
                    />
                ))}
            </div>
        </div>
    );
}
