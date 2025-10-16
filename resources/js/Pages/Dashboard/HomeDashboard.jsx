import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import PlaylistModal from "../../Components/modal/PlaylistModal.jsx";
import CompleteProfileModal from "../../Components/modal/CompleteProfileModal.jsx"; // <-- 1. Importa el nuevo modal

export default function HomeDashboard() {
    const { auth, playlistData, mustCompleteProfile } = usePage().props; // <-- 2. Obtén la nueva prop
    const user = auth.user;

    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [localPlaylistData, setLocalPlaylistData] = useState(null);

    useEffect(() => {
        if (playlistData) {
            setLocalPlaylistData(playlistData);
            setIsPlaylistModalOpen(true);
        }
    }, [playlistData]);

    const closePlaylistModal = () => {
        setIsPlaylistModalOpen(false);
        setLocalPlaylistData(null);
    }

    // --- ✅ LÓGICA CLAVE AÑADIDA ---
    // 3. Si se debe completar el perfil, muestra el modal y nada más del dashboard.
    if (mustCompleteProfile) {
        return (
            <DashboardLayout>
                <CompleteProfileModal isOpen={true} user={user} />
            </DashboardLayout>
        );
    }

    // Si el perfil está completo, se renderiza el dashboard normal.
    return (
        <DashboardLayout>
            <div>
                <h1>Bienvenido, {user.first_name || user.username}</h1>
            </div>

            <PlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                playlistData={localPlaylistData}
            />
        </DashboardLayout>
    );
}
