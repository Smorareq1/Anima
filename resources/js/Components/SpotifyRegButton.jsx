import React from "react";
import SpotifyLogo from "../../../public/images/spotify-logo.svg";

export default function SpotifyButton({disabled}) {
    const handleSpotifyLogin = () => {
        if (!disabled) {
            window.location.href = route("spotify.redirect");
        }
    };

    return (
        <button type="button" className="btn-spotify" onClick={handleSpotifyLogin} disabled={disabled}>
            <img src={SpotifyLogo} alt="Spotify" className="spotify-icon" />
            {disabled ? "Spotify vinculado" : "Utiliza Anima con Spotify"}
        </button>
    );
}
