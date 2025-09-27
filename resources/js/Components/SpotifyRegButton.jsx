import React from "react";
import SpotifyLogo from "../../images/spotify-logo.svg";

export default function SpotifyButton() {
    const handleSpotifyLogin = () => {
        window.location.href = route('spotify.redirect');
    };

    return (
        <button type="button" className="btn-spotify" onClick={handleSpotifyLogin}>
            <img src={SpotifyLogo} alt="Spotify" className="spotify-icon" />
            Utilizá Ánima con Spotify
        </button>
    );
}
