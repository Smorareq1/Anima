import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';

// Esquema de validación con Yup
const validationSchema = Yup.object({
    nombre: Yup.string()
        .required("Campo obligatorio")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder los 50 caracteres"),

    apellido: Yup.string()
        .required("Campo obligatorio")
        .min(2, "El apellido debe tener al menos 2 caracteres")
        .max(50, "El apellido no puede exceder los 50 caracteres"),

    usuario: Yup.string()
        .required("Campo obligatorio")
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .max(20, "El usuario no puede exceder los 20 caracteres")
        .matches(/^[a-zA-Z0-9_]+$/, "El usuario solo puede contener letras, números y guiones bajos"),

    correo: Yup.string()
        .email("Ingresa un correo electrónico válido")
        .required("Campo obligatorio"),

    password: Yup.string()
        .required("Campo obligatorio")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
        ),

    password_confirmation: Yup.string()
        .required("Confirma tu contraseña")
        .oneOf([Yup.ref('password')], "Las contraseñas no coinciden")
});

export default function RegisterForm() {
    const formik = useFormik({
        initialValues: {
            nombre: "",
            apellido: "",
            usuario: "",
            correo: "",
            password: "",
            password_confirmation: "",
        },
        validationSchema: validationSchema,
        onSubmit: (values, { setSubmitting, setFieldError }) => {
            const payload = {
                first_name: values.nombre,
                last_name: values.apellido,
                username: values.usuario,
                email: values.correo,
                password: values.password,
                password_confirmation: values.password_confirmation,
            };

            router.post(route("auth.register.store"), payload, {
                onSuccess: () => {
                    console.log("Registro exitoso!");
                },
                onError: (errors) => {
                    console.error("Errores del servidor:", errors);
                    if (errors.email) setFieldError('correo', errors.email);
                    if (errors.username) setFieldError('usuario', errors.username);
                },
                onFinish: () => {
                    setSubmitting(false);
                }
            });
        },
    });

    // Función auxiliar para mostrar errores
    const getFieldError = (fieldName) => {
        return formik.touched[fieldName] && formik.errors[fieldName]
            ? formik.errors[fieldName]
            : null;
    };

    return (
        <form className="register-form" onSubmit={formik.handleSubmit}>
            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formik.values.nombre}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={getFieldError('nombre') ? 'error' : ''}
                    />
                    {getFieldError('nombre') && (
                        <div className="error-message">{getFieldError('nombre')}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={formik.values.apellido}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={getFieldError('apellido') ? 'error' : ''}
                    />
                    {getFieldError('apellido') && (
                        <div className="error-message">{getFieldError('apellido')}</div>
                    )}
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="usuario">Usuario</label>
                    <input
                        type="text"
                        id="usuario"
                        name="usuario"
                        value={formik.values.usuario}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={getFieldError('usuario') ? 'error' : ''}
                    />
                    {getFieldError('usuario') && (
                        <div className="error-message">{getFieldError('usuario')}</div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="correo">Correo</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formik.values.correo}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={getFieldError('correo') ? 'error' : ''}
                    />
                    {getFieldError('correo') && (
                        <div className="error-message">{getFieldError('correo')}</div>
                    )}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getFieldError('password') ? 'error' : ''}
                />
                {getFieldError('password') && (
                    <div className="error-message">{getFieldError('password')}</div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formik.values.password_confirmation}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={getFieldError('password_confirmation') ? 'error' : ''}
                />
                {getFieldError('password_confirmation') && (
                    <div className="error-message">{getFieldError('password_confirmation')}</div>
                )}
            </div>

            <a href={route('auth.login.show')} className="redirect-link">
                ¿Ya tenés una cuenta? Iniciá sesión
            </a>

            <button
                type="submit"
                className="btn-primary"
                disabled={formik.isSubmitting}
            >
                {formik.isSubmitting ? "Registrando..." : "Empezar"}
            </button>
        </form>
    );
}
