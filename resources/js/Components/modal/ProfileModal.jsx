import React, {useRef, useState} from "react";
import SpotifyRegButton from "../SpotifyRegButton.jsx";
import "../../../css/profile.css";
import { useForm } from "@inertiajs/react";
import avatar from "../../../images/avatar.png";
import { useFormik } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
    first_name: Yup.string()
        .required("El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres"),
        
    last_name: Yup.string()
        .required("El apellido es requerido")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres"),

    username: Yup.string()
        .required("El usuario es requerido ")
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .max(20, "El usuario no puede exceder 20 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/, "Solo se permiten letras, números y guiones bajos"),

    email: Yup.string()
        .required("El correo es necesario")
        .email("Ingresa un correo válido"),

    password: Yup.string()
        .min(8, "La contraseña debe contener al menos 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Debe contener al menos una mayúscula, una minúscula y un número")
        .nullable()
        .transform((value) => value || null),

    photo: Yup.mixed()
        .test("fileSize", "La imagen es muy pesada (máx. 2MB)", (value) => {
            if (!value) return true;
            return value.size <= 2 * 1024 * 1024;
        })
        .test("fileType", "Solo se permiten imágenes (JPEG, PNG, JPG)", (value) => {
            if (!value) return true;
            return ["image/jpeg", "image/png", "image/jpg"].includes(value.type);
        })
});

export default function ProfileModal({ isOpen, onClose, user, hasSpotify}) {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);

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
        onSubmit: (values) =>{
            post(route("Home"), {
                data: values,
                onSuccess: () => onClose(),
            });
        },
    });

    const { post, processing } = useForm();

    const handlePhotoClick = () => {
        fileInputRef.current.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        
        if (file) {
        // Validar el archivo antes de establecerlo
        const fileSizeValid = file.size <= 2 * 1024 * 1024;
        const fileTypeValid = ["image/jpeg", "image/png", "image/jpg"].includes(file.type);
        
        if (!fileSizeValid) {
            formik.setFieldError("photo", "La imagen es muy pesada (máx. 2MB)");
            return;
        }
        
        if (!fileTypeValid) {
            formik.setFieldError("photo", "Solo se permiten imágenes (JPEG, PNG, JPG)");
            return;
        }

        formik.setFieldValue("photo", file);
        formik.setFieldError("photo", null);

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        formik.handleSubmit();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    ×
                </button>

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
                            accept="image/jpeg, image/png, image/jpg"
                        />
                        {formik.errors.photo && (
                            <span className="error">{formik.errors.photo}</span>
                        )}
                    </div>

                    {/* Campos */}
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
                            placeholder="********"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={formik.touched.password && formik.errors.password ? "error-input" : ""}
                        />
                        {formik.touched.password && formik.errors.password && (
                            <span className="error">{formik.errors.password}</span>
                        )}
                    </label>

                    {/* Botones */}
                    <div className="botones">
                        <button type="submit" className="btn-outline" disabled={processing || !formik.isValid}>
                        Guardar cambios
                        </button>
                        <SpotifyRegButton disabled = {hasSpotify}/>
                    </div>
                </form>
            </div>
        </div>
    );
}