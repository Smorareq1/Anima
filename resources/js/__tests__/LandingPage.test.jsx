import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "../Pages/Home";

// Mock de @inertiajs/react
jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    Link: ({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    Head: ({ title }) => <title>{title}</title>,
}));

// Mock de route()
global.route = (name) => {
    const routes = {
        "auth.login.show": "/login",
        "auth.register.show": "/register",
    };
    return routes[name] || "/";
};

describe("Landing Page - Header", () => {
    test("muestra los botones de 'Inicia sesión' y 'Regístrate'", () => {
        render(<Home />);
        const loginButton = screen.getByRole("link", { name: /inicia sesión/i });
        const registerButton = screen.getByRole("link", { name: /regístrate/i });
        expect(loginButton).toBeInTheDocument();
        expect(registerButton).toBeInTheDocument();
    });

    test("los enlaces apuntan a las rutas correctas (/login y /register)", () => {
        render(<Home />);
        const loginLink = screen.getByRole("link", { name: /inicia sesión/i });
        const registerLink = screen.getByRole("link", { name: /regístrate/i });
        expect(loginLink).toHaveAttribute("href", "/login");
        expect(registerLink).toHaveAttribute("href", "/register");
    });
});
