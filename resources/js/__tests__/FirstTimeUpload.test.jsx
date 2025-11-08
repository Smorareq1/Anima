import React from "react";
import { render, screen, within } from "@testing-library/react";
import FirstTimeUpload from "../Pages/FirstTimeUpload";

// Mock de @inertiajs/react para simular el componente Link y evitar navegación real
jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    Link: ({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

// Mock de ziggy-js para simular las rutas usadas en el componente
jest.mock("ziggy-js", () => ({
    __esModule: true,
    route: (name) => {
        const routes = {
            Home: "/",
            Dashboard: "/dashboard",
        };
        return routes[name] || "/";
    },
}));

// Mock de AuthLayout para comprobar que recibe correctamente los props
jest.mock("../Components/AuthLayout.jsx", () => ({
    __esModule: true,
    default: ({ leftContent, rightContent }) => (
        <div data-testid="mock-authlayout">
            <div data-testid="left-content">{leftContent}</div>
            <div data-testid="right-content">{rightContent}</div>
        </div>
    ),
}));

// Mock de EmotionUpload para aislar el test del contenido interno del componente
jest.mock("../Components/EmotionUpload", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-emotionupload">[EmotionUpload]</div>,
}));

describe("Componente FirstTimeUpload", () => {
    test("muestra el título, subtítulo y enlace principal", () => {
        render(<FirstTimeUpload />);

        expect(
            screen.getByText(/Empieza a sentir la música/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Subí una foto o tomate una ahora/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/¿No quieres tomarte una foto ahora/i)
        ).toBeInTheDocument();
    });

    test("renderiza los subcomponentes EmotionUpload y AuthLayout", () => {
        render(<FirstTimeUpload />);
        expect(screen.getByTestId("mock-emotionupload")).toBeInTheDocument();
        expect(screen.getByTestId("mock-authlayout")).toBeInTheDocument();
    });

    test("usa las rutas correctas para los enlaces Home y Dashboard", () => {
        render(<FirstTimeUpload />);

        const homeLink = screen.getByRole("link", { name: /logo/i });
        expect(homeLink).toHaveAttribute("href", "/");

        const dashboardLink = screen.getByRole("link", {
            name: /¿No quieres tomarte una foto ahora/i,
        });
        expect(dashboardLink).toHaveAttribute("href", "/dashboard");
    });

    test("pasa correctamente leftContent y rightContent al AuthLayout", () => {
        render(<FirstTimeUpload />);

        const leftContent = screen.getByTestId("left-content");
        const rightContent = screen.getByTestId("right-content");

        expect(leftContent).toBeInTheDocument();
        expect(rightContent).toBeInTheDocument();

        // Dentro del contenido izquierdo debe aparecer el título principal
        expect(
            within(leftContent).getByText(/Empieza a sentir la música/i)
        ).toBeInTheDocument();

        // Dentro del contenido derecho debe incluir EmotionUpload
        expect(
            within(rightContent).getByTestId("mock-emotionupload")
        ).toBeInTheDocument();
    });
});
