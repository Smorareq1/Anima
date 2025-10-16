import { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import "../../css/topbar.css";
import avatar from "../../images/avatar.png";
import ProfileModal from "./modal/ProfileModal.jsx";

// Helper function to check if a string is a full URL
const isAbsoluteUrl = (url) => {
    if (typeof url !== 'string') return false;
    return /^(?:[a-z+]+:)?\/\//i.test(url);
};

export default function Topbar({ onToggleSidebar }) {
    const { auth, hasSpotify } = usePage().props;
    const user = auth.user;

    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // --- ✅ LÓGICA CORREGIDA PARA EL AVATAR ---
    // Determina la fuente correcta de la imagen
    const getAvatarSrc = () => {
        if (user?.avatar) {
            // Si es una URL completa (de Spotify), úsala directamente
            if (isAbsoluteUrl(user.avatar)) {
                return user.avatar;
            }
            // Si es un archivo local, añade /storage/
            return `/storage/${user.avatar}`;
        }
        // Si no hay avatar, usa el de por defecto
        return avatar;
    };

    return (
        <div className="dashboard-topbar">
            <button className="sidebar-toggle" onClick={onToggleSidebar}>
                ☰
            </button>

            {user && (
                <div className="topbar-user" ref={menuRef}>
                    <p className="topbar-user-info">
                        Hola, <strong>{user.username}</strong>
                    </p>
                    <button
                        className="avatar-button"
                        onClick={() => setOpen(!open)}
                    >
                        {/* Se llama a la nueva función para obtener la URL */}
                        <img
                            src={getAvatarSrc()}
                            alt="profile"
                            className="avatar-img"
                        />
                    </button>

                    {open && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={() => setModalOpen(true)}
                            >
                                Editar perfil
                            </button>
                            <ProfileModal
                                isOpen={modalOpen}
                                onClose={() => setModalOpen(false)}
                                user={user}
                                hasSpotify={hasSpotify}
                            />
                            <Link
                                href={route("auth.logout")}
                                method="post"
                                as="button"
                                className="dropdown-item-logout"
                            >
                                Cerrar sesión
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
