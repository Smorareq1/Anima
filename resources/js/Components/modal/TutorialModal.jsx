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
                    <video src=""></video>
                    <SpotifyRegButton />
                </div>
            </div>
        </div>
    );
}
