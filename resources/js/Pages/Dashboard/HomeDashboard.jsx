import DashboardLayout from "../../Layout/DashboardLayout.jsx";
import { usePage, router } from '@inertiajs/react';
import {useState, useEffect} from 'react';
import PlaylistModal from "../../Components/modal/PlaylistModal.jsx";

export default function HomeDashboard() {
    const props = usePage().props; // aquí llegan las props globales
    const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
    const [playlistData, setPlaylistData] = useState(null);

    useEffect(() =>{
        if(props.playlistData){
            console.log("Datos de playlist recibidos", props.playlistData);
            setPlaylistData(props.playlistData);
            setIsPlaylistModalOpen(true);
        }
    }, [props.playlistData]);

    const closePlaylistModal = () =>{
        setIsPlaylistModalOpen(false);
        setPlaylistData(null);
    }

    return (
        <DashboardLayout>
            <div>
                <h1>Bienvenido, {props.auth.user.username}</h1>
            </div>

            <PlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                playlistData={playlistData}
            />
        </DashboardLayout>
    );
}
