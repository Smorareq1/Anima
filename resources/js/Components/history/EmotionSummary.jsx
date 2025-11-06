import React, { useState, useEffect } from "react";
import EmotionItem from "./EmotionItem.jsx";
import "../../../css/history.css";
import { ChevronUp } from "lucide-react";

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
                    <button
                        className="toggle-btn"
                        onClick={() => setOpen(!open)}
                    >
                        <ChevronUp
                            style={{
                                transform: open ? "rotate(0deg)" : "rotate(180deg)",
                                transition: "transform 0.3s ease",
                            }}
                        />
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
