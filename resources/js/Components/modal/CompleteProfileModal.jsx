import React from "react";
import "../../../css/profile.css";
import { useForm } from "@inertiajs/react";

export default function CompleteProfileModal({ isOpen, onClose, user }) {
    const { data, setData, post, processing, errors } = useForm({
        first_name: "",
        last_name: "",
        username: user?.username || "",
        email: user?.email || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // ruta correcta al backend
        // post(route("profile.complete"), {
            //onSuccess: () => onClose(),
        //});
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-title">Completa tu perfil</h2>

                <form className="profile-form" onSubmit={handleSubmit}>
                    <label>
                        Usuario
                        <input
                            type="text"
                            value={data.username}
                            disabled
                        />
                    </label>

                    <label>
                        Correo
                        <input
                            type="email"
                            value={data.email}
                            disabled
                        />
                    </label>

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

                    <button type="submit" className="btn-primary" disabled={processing}>
                        Guardar
                    </button>
                </form>
            </div>
        </div>
    );
}
