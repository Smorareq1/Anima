import React, { useState, useEffect } from "react";
import EmotionItem from "./EmotionItem.jsx";
import "../../../css/history.css";

export default function EmotionSummary({ summaryData }) {
    const [open, setOpen] = useState(true);

    // Detecta si la pantalla es pequeña y colapsa por defecto
    useEffect(() => {
        const checkSize = () => {
            if (window.innerWidth < 768) {
                setOpen(false); // en mobile, inicia cerrado
            } else {
                setOpen(true); // en desktop, siempre abierto
            }
        };

        checkSize();
        window.addEventListener("resize", checkSize);
        return () => window.removeEventListener("resize", checkSize);
    }, []);

    return (
        <div className={`emotion-summary ${open ? "open" : "collapsed"}`}>
            <div className="emotion-summary-header">
                <h3>Resumen</h3>
                <div className="summary-actions">
                    <a href="#">Ver todo</a>
                    <button
                        className="toggle-btn"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? "▲" : "▼"}
                    </button>
                </div>
            </div>

            {open && (
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
            )}
        </div>
    );
}
