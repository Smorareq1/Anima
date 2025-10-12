import React, {useRef, useState} from "react";
import SpotifyRegButton from "../SpotifyRegButton.jsx";
import "../../../css/playlistModal.css";
import { useForm } from "@inertiajs/react";
import Logo from "../../../images/img_playlist.svg";
import Plus from "../../../images/ic_baseline-plus.svg";
import Minus from "../../../images/minus.svg"; 
import SpotifyLogo from "../../../images/spotify-logo.svg";

export default function PlaylistModal({isOpen, onClose, playlistData}){
    const [showArtists, setShowArtists] = useState(false);
    const [showTracks, setShowTracks] = useState(false);

    if (!isOpen) {
        return null;
    }

    //Función para copiar enlace
    const copyToClipboard = (text) =>{
        if(!text) return;
        navigator.clipboard.writeText(text).then(() =>{
            alert('Enlace copiado al portapapeles');
        });
    };

    const uniqueArtists = [...new Set(playlistData?.tracks?.map(track => track.artist))];

    const handleClose = () => {
        onClose();
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
                            <input type="text" placeholder="Nombre de tu playlist"/>
                            <button>Confirmar</button>
                        </div>

                        <div className="campo link">
                            <input type="text" value={''} readOnly disabled/>
                            <button onClick={() => copyToClipboard("Hola")}>Copiar</button>
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
                                                    <p className="track-name">{track.name}</p>
                                                    <p className="track-artist">{track.artist}</p>
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
                        <button className="playlist">
                            Ir a la playlist
                        </button>

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

