import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import PlaylistCarousel from "./PlaylistCarousel.jsx";
import DashboardLayout from "../Layout/DashboardLayout.jsx";
import "../../css/playlistView.css";
import SpotifyLogo from "../../images/spotify-logo.svg";

const emotionTranslations = {
    HAPPY: "FELIZ",
    SAD: "TRISTE",
    ANGRY: "ENOJADO",
    CALM: "CALMADO",
    SURPRISED: "SORPRENDIDO",
    CONFUSED: "CONFUNDIDO",
    DISGUSTED: "DISGUSTADO",
    FEAR: "MIEDO",
};

export default function PlaylistShow({ playlist }) {
    const { playlistData, emotion } = usePage().props; // props cuando viene del temp
    const isTemp = !!playlistData; // si existe playlistData, es temp
    const currentPlaylist = playlist || playlistData;

    const [playlistName, setPlaylistName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const goToSpotify = () => {
        if (!currentPlaylist?.spotify_url) {
            alert("No hay enlace de Spotify disponible");
            return;
        }
        window.open(currentPlaylist.spotify_url, "_blank", "noopener,noreferrer");
    };

    const handleSave = () => {
        if (!playlistName.trim()) {
            alert("Por favor ingresa un nombre para la playlist");
            return;
        }

        setIsSaving(true);

        router.post(
            route("emotion.playlists.store"),
            {
                playlist_name: playlistName,
                tracks: currentPlaylist.tracks,
                emotion: emotion || currentPlaylist.main_emotion,
            },
            {
                onSuccess: (page) => {
                    const newPlaylist = page.props.flash?.playlist;
                    if (newPlaylist) {
                        router.visit(route("emotion.playlists.show", { id: newPlaylist.id }));
                    } else {
                        setSaved(true);
                        setIsSaving(false);
                    }
                },
                onError: () => {
                    setIsSaving(false);
                    alert("Error al guardar la playlist");
                },
            }
        );
    };

    if (!currentPlaylist) {
        return (
            <DashboardLayout>
                <div className="playlist-view">
                    <p>Playlist no encontrada</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="playlist-view">
                <div
                    className="back-arrow"
                    onClick={() => {
                        if(saved || !isTemp){
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                router.visit(route("Record"));
                            }
                        }else {
                            const confirmExit = window.confirm("Los cambios no guardados se perderán. ¿Deseas salir?");
                            if (!confirmExit) return;
                            if (window.history.length > 1) {
                                window.history.back();
                            } else {
                                router.visit(route("Record"));
                            }
                        }
                    }}
                    title="Volver"
                >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                </div>

                <div className="playlist-header">
                    {isTemp ? (
                        console.log(currentPlaylist.tracks),
                        <>
                            <h1 className="playlist-title">Nueva Playlist</h1>
                            <p className="playlist-info">
                                Emoción principal:{" "}
                                <strong>{emotionTranslations[emotion] || emotion}</strong>
                                <br />
                                Otras emociones: {" "}
                                {currentPlaylist.emotions_used
                                    ?.filter((e) => e.type !== currentPlaylist.emotion)
                                    .map((e) => emotionTranslations[e.type] || e.type)
                                    .join(", ")}
                            </p>
                            <input
                                type="text"
                                value={playlistName}
                                onChange={(e) => setPlaylistName(e.target.value)}
                                placeholder="Escribe un nombre para tu playlist"
                                className="playlist-input"
                            />
                            <button
                                className="save-btn"
                                onClick={handleSave}
                                disabled={isSaving || saved}
                            >
                                {saved ? "Guardada ✔" : isSaving ? "Guardando..." : "Guardar Playlist"}
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="playlist-title">{currentPlaylist.name}</h1>
                            <p className="playlist-info">
                                Emoción principal:{" "}
                                <strong>
                                    {emotionTranslations[currentPlaylist.main_emotion] ||
                                        currentPlaylist.main_emotion}
                                </strong>
                                <br />
                                Otras emociones:{" "}
                                {currentPlaylist.emotions_used
                                    ?.filter((e) => e.type !== currentPlaylist.main_emotion)
                                    .map((e) => emotionTranslations[e.type] || e.type)
                                    .join(", ")}
                            </p>
                        </>
                    )}
                </div>

                {!isTemp && (
                    <div>
                        <button className="spotify2" onClick={goToSpotify}>
                            <img className="img-modal" src={SpotifyLogo} alt="SpotifyLogo" />
                            Abrir en Spotify
                        </button>
                    </div>
                )}

                <PlaylistCarousel tracks={currentPlaylist.tracks} />
            </div>
        </DashboardLayout>
    );
}
