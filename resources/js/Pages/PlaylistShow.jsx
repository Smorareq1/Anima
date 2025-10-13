import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import PlaylistCarousel from "./PlaylistCarousel.jsx";
import DashboardLayout from "../Layout/DashboardLayout.jsx";
import "../../css/playlistView.css";

export default function PlaylistShow({ id }) {
    const [playlist, setPlaylist] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("playlists")) || [];
        const found = saved.find((p) => p.id === id);
        if (!found) {
            alert("Playlist no encontrada 😕");
            router.visit("/records");
        } else {
            setPlaylist(found);
        }
    }, [id]);

    if (!playlist) return null;

    return (
        <DashboardLayout>
            <div className="playlist-view">
                {/* Flecha visible dentro del área principal */}
                <div
                    className="back-arrow"
                    onClick={() => router.visit("/records")}
                    title="Volver al historial"
                >
                    <ArrowLeft size={22} strokeWidth={2.5} />
                </div>

                <div className="playlist-header">
                    <h1 className="playlist-title">{playlist.name}</h1>
                    <p className="playlist-info">
                        Emoción: <strong>{playlist.emotion}</strong> ({playlist.confidence}%)
                    </p>
                </div>

                <PlaylistCarousel tracks={playlist.tracks} />
            </div>
        </DashboardLayout>

    );
}
