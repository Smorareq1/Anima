import { useState, useRef, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import "../../css/topbar.css";
import avatar from "../../images/avatar.png";
import ProfileModal from "./modal/ProfileModal.jsx";
import CompleteProfileModal from "./modal/CompleteProfileModal.jsx"; //Solo para probarlo

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

    return (
        <div className="dashboard-topbar">
            <button className="sidebar-toggle" onClick={onToggleSidebar}>
                ☰
            </button>

            {/* Avatar */}
            {user && (
                <div className="topbar-user" ref={menuRef}>
                    <p className="topbar-user-info">
                        Hola, <strong>{user.username}</strong>
                    </p>
                    <button
                        className="avatar-button"
                        onClick={() => setOpen(!open)}
                    >
                        <img
                            src={user.avatar && user.avatar !== "" ? user.avatar : avatar}
                            alt="profile"
                            className="avatar-img"
                        />
                    </button>

                    {open && (
                        <div className="dropdown-menu">
                            <button
                                className="dropdown-item"
                                onClick={() => {
                                    setModalOpen(true);
                                }}
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
                                href={route("Home")} // todo: crear ruta del logout y colocarla aqui
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
