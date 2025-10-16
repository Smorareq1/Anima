import React, { useRef, useState } from "react";
import SpotifyRegButton from "../SpotifyRegButton.jsx";
import "../../../css/profile.css";
import { router } from "@inertiajs/react";
import avatar from "../../../images/avatar.png";
import { useFormik } from "formik";
import * as Yup from "yup";

// Helper function to check if a string is a full URL
const isAbsoluteUrl = (url) => {
    if (typeof url !== 'string') return false;
    return /^(?:[a-z+]+:)?\/\//i.test(url);
}

// Esquema de validación para el frontend
const validationSchema = Yup.object({
    first_name: Yup.string()
        .required("El nombre es requerido"),
    last_name: Yup.string()
        .required("El apellido es requerido"),
    username: Yup.string()
        .required("El usuario es requerido")
        .matches(/^[a-zA-Z0-9_\s]+$/, "Solo se permiten letras, números, _ y espacios"),
    email: Yup.string()
        .required("El correo es necesario")
        .email("Ingresa un correo válido"),
    password: Yup.string()
        .min(8, "Debe tener al menos 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Debe incluir mayúscula, minúscula y número")
        .nullable()
        .transform(value => value || null), // Permite que el campo esté vacío
    photo: Yup.mixed().nullable(),
});

export default function ProfileModal({ isOpen, onClose, user, hasSpotify }) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const getInitialAvatar = () => {
        if (user?.avatar) {
            return isAbsoluteUrl(user.avatar) ? user.avatar : `/storage/${user.avatar}`;
        }
        return avatar;
    };

    const formik = useFormik({
        initialValues: {
            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            username: user?.username || "",
            email: user?.email || "",
            password: "",
            photo: null,
        },
        validationSchema,
        onSubmit: (values) => {
            setProcessing(true);
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key]) { // Solo añade campos que tengan un valor
                    formData.append(key, values[key]);
                }
            });
            formData.append('_method', 'PUT');

            router.post(route("profile.update"), formData, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (serverErrors) => setErrors(serverErrors),
                onFinish: () => setProcessing(false),
            });
        },
    });

    const handlePhotoChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            formik.setFieldValue("photo", file);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === 'string') {
                    setPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <form className="profile-form" onSubmit={formik.handleSubmit}>
                    <div className="profile-avatar">
                        <div className="avatar-circle">
                            <img src={preview || getInitialAvatar()} alt="avatar" className="avatar-img" />
                        </div>
                        <button type="button" className="btn-outline" onClick={() => fileInputRef.current.click()}>
                            Cambiar foto
                        </button>
                        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handlePhotoChange} accept="image/*" />
                        {errors.photo && <span className="error">{errors.photo}</span>}
                    </div>

                    <label>
                        Nombre
                        <input
                            type="text"
                            name="first_name"
                            value={formik.values.first_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.first_name && formik.errors.first_name ? "error-input" : ""}
                        />
                        {formik.touched.first_name && formik.errors.first_name && (
                            <span className="error">{formik.errors.first_name}</span>
                        )}
                    </label>

                    <label>
                        Apellido
                        <input
                            type="text"
                            name="last_name"
                            value={formik.values.last_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.last_name && formik.errors.last_name ? "error-input" : ""}
                        />
                        {formik.touched.last_name && formik.errors.last_name && (
                            <span className="error">{formik.errors.last_name}</span>
                        )}
                    </label>

                    <label>
                        Usuario
                        <input
                            type="text"
                            name="username"
                            value={formik.values.username}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.username && formik.errors.username ? "error-input" : ""}
                        />
                        {formik.touched.username && formik.errors.username && (
                            <span className="error">{formik.errors.username}</span>
                        )}
                    </label>

                    <label>
                        Correo
                        <input
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.email && formik.errors.email ? "error-input" : ""}
                        />
                        {formik.touched.email && formik.errors.email && (
                            <span className="error">{formik.errors.email}</span>
                        )}
                    </label>

                    <label>
                        Contraseña
                        <input
                            type="password"
                            name="password"
                            placeholder="Nueva contraseña (opcional)"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.password && formik.errors.password ? "error-input" : ""}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <span className="error">{formik.errors.password}</span>
                        )}
                    </label>

                    <div className="botones">
                        <button type="submit" className="btn-outline" disabled={processing || !formik.isValid}>
                            {processing ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                        <SpotifyRegButton disabled={hasSpotify} />
                    </div>
                </form>
            </div>
        </div>
    );
}
