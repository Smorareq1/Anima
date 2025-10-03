import React, {useRef, useState} from "react";
import SpotifyRegButton from "../SpotifyRegButton.jsx";
import "../../../css/profile.css";
import { useForm } from "@inertiajs/react";
import avatar from "../../../images/avatar.png";

export default function ProfileModal({ isOpen, onClose, user, hasSpotify}) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        username: user?.username || "",
        email: user?.email || "",
        password: "",
        photo: null,
    });

    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

    const handlePhotoClick = () => {
        fileInputRef.current.click(); // dispara el input oculto
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setData("photo", file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result); //preview de la imagen
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSubmit = (e) => {
        e.preventDefault();

        //colocar ruta correcta
        post(route("Home"), {
            onSuccess: () => onClose(), // cerrar modal al guardar
        });
    };
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

                <h2 className="modal-title">Tu Perfil</h2>

                <form className="profile-form" onSubmit={handleSubmit}>
                    {/* Avatar */}
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            <img
                                src={
                                    preview ||
                                    user?.avatar ||
                                    avatar
                                }
                                alt="avatar"
                                className="avatar-img"
                            />
                        </div>
                        <button
                            type="button"
                            className="btn-outline"
                            onClick={handlePhotoClick}
                        >
                            Cambiar foto
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={handlePhotoChange}
                            accept="image/*"
                        />
                    </div>

                    {/* Campos */}
                    <label>
                        Nombre
                        <input
                            type="text"
                            value={data.first_name}
                            onChange={(e) => setData("first_name", e.target.value)}
                        />
                        {errors.first_name && <span className="error">{errors.first_name}</span>}
                    </label>
                    <label>
                        Apellido
                        <input
                            type="text"
                            value={data.last_name}
                            onChange={(e) => setData("last_name", e.target.value)}
                        />
                        {errors.last_name && <span className="error">{errors.last_name}</span>}
                    </label>

                    <label>
                        Usuario
                        <input
                            type="text"
                            value={data.username}
                            onChange={(e) => setData("username", e.target.value)}
                        />
                        {errors.username && <span className="error">{errors.username}</span>}
                    </label>

                    <label>
                        Correo
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                        />
                        {errors.email && <span className="error">{errors.email}</span>}
                    </label>

                    <label>
                        Contraseña
                        <input
                            type="password"
                            placeholder="********"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                        />
                        {errors.password && <span className="error">{errors.password}</span>}
                    </label>

                    {/* Botones */}
                    <button type="submit" className="btn-outline" disabled={processing}>
                        Guardar cambios
                    </button>
                    <SpotifyRegButton disabled = {hasSpotify}/>
                </form>
            </div>
        </div>
    );
}
