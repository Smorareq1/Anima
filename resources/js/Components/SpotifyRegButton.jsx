import React from "react";
import SpotifyLogo from "../../images/spotify-logo.svg";

export default function SpotifyButton() {
    const handleSpotifyLogin = () => {
        const clientId = "clientidprueba"; //cambiar por el client id real (del .env del backend)
        const redirectUri = "..."; // cambiar a ruta del backend que maneja el callback (igual, del .env del backend)
        const scopes = ["user-read-email", "user-read-private"];

        const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${encodeURIComponent(scopes.join(" "))}`; //revisar si está bien esta parte

        window.location.href = authUrl; // redirige a Spotify
    };

    return (
        <button type="button" className="btn-spotify" onClick={handleSpotifyLogin}>
            <img src={SpotifyLogo} alt="Spotify" className="spotify-icon" />
            Registrate con Spotify
        </button>
    );
}
