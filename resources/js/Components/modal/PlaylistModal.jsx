import React, { useState } from "react";
import { router } from "@inertiajs/react"; // ✅ Import Inertia router
import "../../../css/playlistModal.css";
import Logo from "../../../../public/images/img_playlist.svg";
import Plus from "../../../../public/images/ic_baseline-plus.svg";
import Minus from "../../../../public/images/minus.svg";
import SpotifyLogo from "../../../../public/images/spotify-logo.svg";

const emotionTranslations = {
    HAPPY: "FELIZ",
    SAD: "TRISTE",
    ANGRY: "ENOJADO",
    CALM: "CALMADO",
    SURPRISED: "SORPRENDIDO",
    CONFUSED: "CONFUNDIDO",
    DISGUSTED: "DISGUSTADO",
    FEAR: "MIEDO"
};


export default function PlaylistModal({ isOpen, onClose, playlistData }) {
    const [showArtists, setShowArtists] = useState(false);
    const [showTracks, setShowTracks] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [playlistLink, setPlaylistLink] = useState("");
    const [saved, setSaved] = useState(false);
    const [playlistId, setPlaylistId] = useState(null);

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

        router.post(route('emotion.playlists.store'), {
            playlist_name: playlistName,
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                const createdPlaylist = page.props.flash?.playlist;
                if (createdPlaylist) {
                    const link = createdPlaylist.spotify_url
                        ? createdPlaylist.spotify_url
                        : `${window.location.origin}/playlist/${createdPlaylist.id}`;
                    console.log(link)
                    setPlaylistLink(link);
                    setPlaylistId(createdPlaylist.id);
                    setSaved(true);
                } else {
                    alert('La playlist se guardó, pero no se recibieron los datos de vuelta.');
                }
            },
            onError: (errors) => {
                console.error(errors);
                const firstError = Object.values(errors)[0];
                alert(`Error: ${firstError}`);
            }
        });
    };

    const copyToClipboard = () => {
        if (!playlistLink) return;
        navigator.clipboard.writeText(playlistLink).then(() => {
            alert("Enlace copiado al portapapeles");
        });
    };

    const goToPlaylist = () => {
        if (!playlistId) return;
        onClose();
        router.visit(route('emotion.playlists.show', { id: playlistId }));
    };

    const goToSpotify = () => {
        console.log(playlistLink);
        if (!playlistLink) return;
        window.open(playlistLink, '_blank');
    }
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
                        {(playlistData?.emotions_used || playlistData?.emotions)?.map((emotion, index) => (
                            <div key={index} className="emotion">
                                <h3>{emotionTranslations[emotion.type] || emotion.type}</h3>
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
                        {saved && (
                        <button className="spotify" onClick={goToSpotify}>
                            <img className="img-modal" src={SpotifyLogo} alt="SpotifyLogo"/>
                            Abrir en Spotify
                        </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
