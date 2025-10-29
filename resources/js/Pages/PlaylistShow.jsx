import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import PlaylistCarousel from "./PlaylistCarousel.jsx";
import DashboardLayout from "../Layout/DashboardLayout.jsx";
import "../../css/playlistView.css";
import SpotifyLogo from "../../images/spotify-logo.svg";
import Notification from "../Components/modal/Notification.jsx";
import ConfirmationModal from "../Components/modal/ConfirmationModal.jsx";

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
    const [showNotification, setShowNotification] = useState(false);
    const { playlistData, emotion } = usePage().props; // props cuando viene del temp
    const isTemp = !!playlistData; // si existe playlistData, es temp
    const currentPlaylist = playlist || playlistData;
    const [showExitModal, setShowExitModal] = useState(false); // Nuevo estado para el modal
    const [notificationMessage, setNotificationMessage] = useState("");

    const [playlistName, setPlaylistName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCloseNotification = () =>{
        setShowNotification(false);
    }

    const goToSpotify = () => {
        if (!currentPlaylist?.spotify_url) {
            setNotificationMessage("No hay enlace de Spotify disponible. Conectá tu cuenta en la configuración.");
            setShowNotification(true);
            return;
        }
        window.open(currentPlaylist.spotify_url, "_blank", "noopener,noreferrer");
    };

    const handleSave = () => {
        if (!playlistName.trim()) {
            setNotificationMessage("Ingresá un nombre para tu nueva playlist");
            setShowNotification(true);
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

    const handleBack = () => {
        // Si es una playlist temporal sin nombre
        if (isTemp && !saved && playlistName.trim() === "") {
            setShowExitModal(true);
            return;
        }

        // Si hay cambios no guardados (nombre puesto pero no guardado)
        if (isTemp && !saved && playlistName.trim() !== "") {
            setShowExitModal(true); // Mostrar modal de confirmación
            return;
        }

        // Si está guardado o no es temporal, salir directamente
        navigateBack();
    };

    const navigateBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.visit(route("Record"));
        }
    };

    const handleConfirmExit = () => {
        setShowExitModal(false);
        navigateBack();
    };

    const handleCancelExit = () => {
        setShowExitModal(false);
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
                    onClick={handleBack}
                    title="Volver"
                >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                </div>

                <div className="playlist-header">
                    {isTemp ? (
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

                {showNotification && (
                    <Notification
                        message={notificationMessage}
                        type="warning"
                        onClose={handleCloseNotification}
                        duration={6000}
                    />
                )}

                <ConfirmationModal
                    isOpen={showExitModal}
                    onConfirm={handleConfirmExit}
                    onCancel={handleCancelExit}
                    title="¿Salir sin guardar?"
                    message="Tienes cambios sin guardar. Si sales ahora, perderás la playlist generada."
                    confirmText="Salir sin guardar"
                    cancelText="Seguir editando"
                    type="warning"
                 />
            </div>
        </DashboardLayout>
    );
}
