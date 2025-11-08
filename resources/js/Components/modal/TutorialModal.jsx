import React, { useRef, useState } from "react";
import "../../../css/tutorial.css";
import SpotifyRegButton from "../SpotifyRegButton.jsx";

export default function TutorialModal({ isOpen, onClose }) {

    if (!isOpen) return null;

    const  handleClose = () =>{
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-content">
                    <h3>Llevá ÁNIMA a otro nivel con Spotify</h3>
                    <iframe
                        width="100%"
                        height="400"
                        src="https://www.youtube.com/embed/a6K--VOJ-wI"
                        title="Tutorial de Ánima - Cómo transformar emociones en música"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                    <SpotifyRegButton />
                </div>
            </div>
        </div>
    );
}
