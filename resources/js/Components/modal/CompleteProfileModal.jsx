import React from "react";
import "../../../css/profile.css"; // Reutilizamos el CSS
import { useForm } from "@inertiajs/react";
import avatar from "../../../images/avatar.png";

// Helper para obtener la URL correcta del avatar
const isAbsoluteUrl = (url) => {
    if (typeof url !== 'string') return false;
    return /^(?:[a-z+]+:)?\/\//i.test(url);
}

export default function CompleteProfileModal({ isOpen, user }) {
    // Usamos el hook useForm de Inertia, es más simple
    const { data, setData, post, processing, errors } = useForm({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        // Mantenemos estos datos para que se envíen en la petición de actualización
        username: user?.username || "",
        email: user?.email || "",
    });

    const getAvatarSrc = () => {
        if (user?.avatar) {
            return isAbsoluteUrl(user.avatar) ? user.avatar : `/storage/${user.avatar}`;
        }
        return avatar;
    };

    function handleSubmit(e) {
        e.preventDefault();
        // Hacemos un POST que simula un PUT a la ruta que ya tienes.
        // Laravel lo entenderá gracias al _method que se añade automáticamente.
        post(route("profile.update"), {
            preserveState: false, // Forzamos una recarga completa de la página en éxito
        });
    }

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal" style={{textAlign: 'center'}}>
                <h2>¡Bienvenido a Ánima!</h2>
                <p style={{marginBottom: '20px'}}>Para continuar, por favor completa tu perfil.</p>

                <div className="avatar-circle" style={{margin: '0 auto 20px auto'}}>
                    <img src={getAvatarSrc()} alt="avatar" className="avatar-img" />
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>
                    {/* Campos no editables */}
                    <label>Usuario</label>
                    <input type="text" value={data.username} disabled />

                    <label>Correo</label>
                    <input type="email" value={data.email} disabled />

                    {/* Campos a completar */}
                    <label>Nombre</label>
                    <input
                        type="text"
                        value={data.first_name}
                        onChange={(e) => setData("first_name", e.target.value)}
                        className={errors.first_name ? "error-input" : ""}
                        autoFocus // El cursor aparecerá aquí automáticamente
                    />
                    {errors.first_name && <span className="error">{errors.first_name}</span>}

                    <label>Apellido</label>
                    <input
                        type="text"
                        value={data.last_name}
                        onChange={(e) => setData("last_name", e.target.value)}
                        className={errors.last_name ? "error-input" : ""}
                    />
                    {errors.last_name && <span className="error">{errors.last_name}</span>}

                    <div className="botones" style={{justifyContent: 'center', marginTop: '20px'}}>
                        <button type="submit" className="btn-outline" disabled={processing}>
                            {processing ? 'Guardando...' : 'Guardar y continuar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
