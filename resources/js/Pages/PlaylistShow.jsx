import React from "react";
import { router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import PlaylistCarousel from "./PlaylistCarousel.jsx";
import DashboardLayout from "../Layout/DashboardLayout.jsx";
import "../../css/playlistView.css";

export default function PlaylistShow({ playlist }) {
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
                        Emocion principal: <strong>{playlist.main_emotion}</strong> <br></br>
                        Otras emociones: {playlist.emotions_used
                        .filter(e => e.type !== playlist.main_emotion)
                        .map(e => `${e.type}`)
                        .join(", ")}
                    </p>
                </div>

                <PlaylistCarousel tracks={playlist.tracks} />
            </div>
        </DashboardLayout>
    );
}
