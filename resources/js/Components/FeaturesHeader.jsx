import React from "react";
import { Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import '../../css/info.css';
import SpotifyLogo from "../../images/spotify-logo.svg";

const FeaturesHeader = () => {
    return (
        <div className="features-header">
            <div className="features-subtitle">
                <h5>¿Porqué usar ÁNIMA?</h5>
            </div>

            <div className="text">
                <h1>
                    Tu emoción en una foto, tu música perfecta en segundos
                </h1>
                <p>
                    Descubre y profundiza con ÁNIMA en cada de tus emociones a través de la música
                </p>
            </div>

        </div>
    );
};

export default FeaturesHeader;
