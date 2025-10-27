import React from 'react';
import "../../css/administrator.css";

export default function RecommendedSongs({ songs }) {

    return (
        <div className="admin-card admin-recommended">
            <h4 className="admin-card-title">Canciones más recomendadas</h4>
            <ul className="admin-song-list">
                {songs.map((song, index) => (
                    <li key={index} className="admin-song-item">
                        {/* Ranking */}
                        <div className="admin-song-rank">{index + 1}</div>

                        {/* Imagen */}
                        <img
                            src={song.imagen}
                            alt={song.nombre}
                            className="admin-song-cover"
                        />

                        {/* Info */}
                        <div className="admin-song-info">
                            <p className="admin-song-title">{song.nombre}</p>
                            <p className="admin-song-artist">{song.artista}</p>
                        </div>

                        {/* Veces recomendada */}
                        <div className="admin-song-count">
                            {song.veces} veces
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
