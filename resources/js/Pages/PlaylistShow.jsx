import React from "react";
import { router } from "@inertiajs/react";
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
    FEAR: "MIEDO"
};

export default function PlaylistShow({ playlist }) {

    const goToSpotify = () => {
        if (!playlist?.spotify_url) {
            alert("No hay enlace de Spotify disponible");
            return;
        }
        window.open(playlist.spotify_url, '_blank', 'noopener,noreferrer');
    }

    if (!playlist) {
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
                    onClick={() => router.visit(route('Record'))}
                    title="Volver al historial"
                >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                </div>

                <div className="playlist-header">
                    <h1 className="playlist-title">{playlist.name}</h1>
                    <p className="playlist-info">
                        Emoción principal:{" "}
                        <strong>
                            {emotionTranslations[playlist.main_emotion] || playlist.main_emotion}
                        </strong>
                        <br />
                        Otras emociones:{" "}
                        {playlist.emotions_used
                            .filter(e => e.type !== playlist.main_emotion)
                            .map(e => emotionTranslations[e.type] || e.type)
                            .join(", ")}
                    </p>
                </div>
                <div>
                    <button className="spotify2" onClick={goToSpotify}>
                        <img className="img-modal" src={SpotifyLogo} alt="SpotifyLogo"/>
                        Abrir en Spotify
                    </button>
                </div>

                <PlaylistCarousel tracks={playlist.tracks} />
            </div>
        </DashboardLayout>
    );
}
