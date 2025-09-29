import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { router, Link } from "@inertiajs/react";
import { route } from 'ziggy-js';

const validationSchema = Yup.object({
    email: Yup.string().email("Correo inválido").required("Campo obligatorio"),
    password: Yup.string().required("Campo obligatorio"),
});

export default function LoginForm() {
    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema,
        onSubmit: (values, { setSubmitting, setFieldError }) => {
            router.post(route("auth.login.store"), values, {
                onError: (errors) => {
                    if (errors.email) {
                        setFieldError('email', errors.email);
                    }
                },
                onFinish: () => {
                    setSubmitting(false);
                }
            });
        }
    });
    return (
        <form className="register-form" onSubmit={formik.handleSubmit}>
            <h2 className="form-title">Inicia sesión</h2>

            <div className="form-group">
                <label htmlFor="usuario">Correo Electrónico</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    {...formik.getFieldProps('email')}
                />
                {formik.touched.email && formik.errors.email ? (
                    <div className="error-message">{formik.errors.email}</div>
                ) : null}
            </div>

            <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    {...formik.getFieldProps('password')}
                />
                {formik.touched.password && formik.errors.password ? (
                    <div className="error-message">{formik.errors.password}</div>
                ) : null}
            </div>
            <a href={route('auth.register.show')} className="redirect-link">
                ¿No tienes una cuenta? Regístrate.
            </a>
            <button type="submit" className="btn-primary">
                Iniciar sesión
            </button>
        </form>
    );
}
