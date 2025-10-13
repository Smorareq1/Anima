import React, { useState } from "react";
import { router } from "@inertiajs/react"; // ✅ Import Inertia router
import "../../../css/playlistModal.css";
import Logo from "../../../images/img_playlist.svg";
import Plus from "../../../images/ic_baseline-plus.svg";
import Minus from "../../../images/minus.svg";
import SpotifyLogo from "../../../images/spotify-logo.svg";

export default function PlaylistModal({ isOpen, onClose, playlistData }) {
    const [showArtists, setShowArtists] = useState(false);
    const [showTracks, setShowTracks] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistLink, setPlaylistLink] = useState("");
    const [saved, setSaved] = useState(false);
    const [playlistId, setPlaylistId] = useState(null); // ✅ Nuevo estado

    if (!isOpen) return null;

    const uniqueArtists = [...new Set(playlistData?.tracks?.map(track => track.artist))];

    const handleClose = () => {
        onClose();
    };

    // Guardar playlist con nombre personalizado
    const handleConfirm = () => {
        if (!playlistName.trim()) {
            alert("Por favor, ingresa un nombre para la playlist");
            return;
        }

        const newPlaylist = {
            id: crypto.randomUUID(),
            name: playlistName,
            emotion: playlistData?.emotion || "Desconocida",
            confidence: playlistData?.confidence || 0,
            created_at: new Date().toISOString(),
            tracks: playlistData?.tracks || []
        };

        // Guardar en localStorage
        const existing = JSON.parse(localStorage.getItem("playlists")) || [];
        existing.push(newPlaylist);
        localStorage.setItem("playlists", JSON.stringify(existing));

        const fakeLink = `${window.location.origin}/playlist/${newPlaylist.id}`;
        setPlaylistLink(fakeLink);
        setPlaylistId(newPlaylist.id); // ✅ guardamos el id
        setSaved(true);
    };

    const copyToClipboard = () => {
        if (!playlistLink) return;
        navigator.clipboard.writeText(playlistLink).then(() => {
            alert("Enlace copiado al portapapeles");
        });
    };

    // ✅ Nueva función: redirigir con Inertia
    const goToPlaylist = () => {
        if (!playlistId) return;
        onClose(); // cierra el modal
        router.visit(`/playlist/${playlistId}`);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleClose}>
                    ×
                </button>
                <div className="modal-container">
                    <div className="modal-header">
                        <img className="img-modal" src={Logo} alt="Logo" />
                        <h2>¡Playlist lista!</h2>
                    </div>

                    <div className="modal-link">
                        <h4>Compartí tu nueva playlist</h4>
                        <div className="campo">
                            <input type="text"
                                placeholder="Nombre de tu playlist"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                            />
                            <button onClick={handleConfirm}>Confirmar</button>
                        </div>

                        <div className="campo link">
                            <input
                                type="text"
                                value={playlistLink}
                                readOnly
                                disabled
                            />
                            <button onClick={copyToClipboard}>Copiar</button>
                        </div>
                    </div>

                    <div className="modal-emotions">
                        {playlistData?.emotions_used?.map((emotion, index) => (
                                <div key={index} className="emotion">
                                    <h3>{emotion.type}</h3>
                                </div>
                            )) || playlistData?.emotions?.map((emotion, index) => (
                                <div key={index} className="emotion">
                                    <h3>{emotion.type}</h3>
                                </div>
                        ))}
                    </div>

                    <div className="modal-playlist">
                        <div className="modal-info" onClick={() => setShowArtists(!showArtists)}>
                            <div className="header-info">
                                <h3>Artistas</h3>
                                <button><img className="img-modal" src={showArtists ? Minus : Plus} alt={showArtists ? "Minus" : "Plus"} /></button>
                            </div>

                            {showArtists && (
                                <div className="dropdown-content">
                                    <div className="artists-list">
                                        {uniqueArtists.map((artist, index) => (
                                            <div key={index} className="artist-item">
                                                <span className="artist-number">{index + 1}</span>
                                                <span className="artist-name">{artist}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-info" onClick={() => setShowTracks(!showTracks)}>
                            <div className="header-info">
                                <h3>Canciones</h3>
                                <button><img className="img-modal" src={showTracks ? Minus : Plus} alt={showArtists ? "Minus" : "Plus"} /></button>
                            </div>
                            {showTracks && (
                                <div className="dropdown-content">
                                    <div className="tracks-list-detailed">
                                        {playlistData?.tracks?.map((track, index) => (
                                            <div key={track.id} className="track-item-detailed">
                                                <span className="track-number">{index + 1}</span>
                                                <img
                                                    src={track.image}
                                                    alt={track.album}
                                                    className="track-image"
                                                />
                                                <div className="track-info-detailed">
                                                    <p className="track-name2">{track.name}</p>
                                                    <p className="track-artist2">{track.artist}</p>
                                                    <p className="track-album">{track.album}</p>
                                                </div>
                                                <span className="track-popularity">
                                                    {track.popularity}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-buttons">
                        {saved && (
                            <button className="playlist" onClick={goToPlaylist}>
                                Ir a la playlist
                            </button>
                        )}
                        <button className="spotify">
                            <img className="img-modal" src={SpotifyLogo} alt="SpotifyLogo" />
                            Abrir en Spotify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
