import React from "react";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { route } from 'ziggy-js';


export default function RegisterForm() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        usuario: "",
        correo: "",
        password: "",
        password_confirmation: "",
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

        // añadir validaciones básicas, poner mensajes de error abajo de cada input, y enviar solamente si pasa validaciones


        // redirigir (prueba) mover esto luego de la respuesta del backend
        router.get(route('emotion.index'));

        console.log("Datos del formulario:", formData); //debug frontend

        // envio con inertia
        router.post(route("register"), formData, {
            onSuccess: (page) => {
                console.log("Respuesta backend (props):", page.props);
            },
            onError: (errors) => {
                console.error("Errores de validación:", errors);
                // aca poner los errores parte del backend, por ejemplo si el usuario o correo ya existen
            },
        });
    };
    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <h2 className="form-title">Crea tu cuenta</h2>

            <div className="form-row">
                <div className="form-group">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="apellido">Apellido</label>
                    <input
                        type="text"
                        id="apellido"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="form-row">
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
                    <label htmlFor="correo">Correo</label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                    />
                </div>
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

            <div className="form-group">
                <label htmlFor="password_confirmation">Confirmar Contraseña</label>
                <input
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                />
            </div>
            <a href={route('Login')} className="redirect-link">
                ¿Ya tenés una cuenta? Iniciá sesión
            </a>
            <button type="submit" className="btn-primary">
                Empezar
            </button>
        </form>
    );
}
