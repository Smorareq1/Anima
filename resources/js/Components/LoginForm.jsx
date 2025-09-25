import React from "react";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';


export default function LoginForm() {
    const [formData, setFormData] = useState({
        usuario: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Datos del formulario:", formData); //debug frontend

        router.get(route("Dashboard")) // prueba de ruta

        // envio con inertia
        router.post(route("login"), formData, {
            onSuccess: (page) => {
                console.log("Respuesta backend (props):", page.props);
            },
            onError: (errors) => {
                console.error("Errores de validación:", errors);
                // aca poner los errores parte del backend, por ejemplo si la contraseña es inval
            },
        });
    };
    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Inicia sesión</h2>

            <div className="form-group">
                <label htmlFor="usuario">Usuario</label>
                <input
                    type="text"
                    id="usuario"
                    name="usuario"
                    value={formData.usuario}
                    onChange={handleChange}
                />
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>
            <a href={route('Register')} className="redirect-link">
                ¿No tienes una cuenta? Regístrate.
            </a>
            <button type="submit" className="btn-primary">
                Iniciar sesión
            </button>
        </form>
    );
}
