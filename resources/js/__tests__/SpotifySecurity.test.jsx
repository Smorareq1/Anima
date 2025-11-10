import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SpotifySecurity from "../Components/SpotifySecurity.jsx";

// 🔹 Mock de TutorialModal (no queremos render real)
jest.mock("../Components/modal/TutorialModal", () => ({
    __esModule: true,
    default: ({ isOpen, onClose }) =>
        isOpen ? (
            <div data-testid="tutorial-modal">
                <p>Tutorial abierto</p>
                <button onClick={onClose}>Cerrar</button>
            </div>
        ) : null,
}));

// 🔹 Mock de las imágenes para evitar errores de import
jest.mock("../../../public/images/decoration/spotify.png", () => "spotify.png");
jest.mock("../../../public/images/decoration/acceso.png", () => "acceso.png");
jest.mock("../../../public/images/decoration/politicas.png", () => "politicas.png");
jest.mock("../../../public/images/decoration/encriptacion.png", () => "encriptacion.png");
jest.mock("../../../public/images/decoration/control.png", () => "control.png");

describe("SpotifySecurity.jsx", () => {
    test("renderiza el texto y las secciones principales", () => {
        render(<SpotifySecurity />);

        expect(screen.getByText(/Conecta tu cuenta de Spotify/i)).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /Acceso/i })).toBeInTheDocument();
        expect(screen.getByText(/Políticas/i)).toBeInTheDocument();
        expect(screen.getByText(/Encriptación/i)).toBeInTheDocument();
        expect(screen.getByText(/Control/i)).toBeInTheDocument();
    });

    test("renderiza correctamente las imágenes de seguridad", () => {
        render(<SpotifySecurity />);

        expect(screen.getByAltText(/Spotify/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Acceso/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Políticas/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Encriptación/i)).toBeInTheDocument();
        expect(screen.getByAltText(/Control/i)).toBeInTheDocument();
    });

    test("abre y cierra el modal de tutorial correctamente", () => {
        render(<SpotifySecurity />);

        // Modal cerrado inicialmente
        expect(screen.queryByTestId("tutorial-modal")).not.toBeInTheDocument();

        // Clic en "Ver tutorial"
        const tutorialButton = screen.getByRole("button", { name: /ver tutorial/i });
        fireEvent.click(tutorialButton);

        // Modal debe aparecer
        expect(screen.getByTestId("tutorial-modal")).toBeInTheDocument();
        expect(screen.getByText("Tutorial abierto")).toBeInTheDocument();

        // Clic en "Cerrar" dentro del modal
        fireEvent.click(screen.getByText("Cerrar"));

        // Modal desaparece
        expect(screen.queryByTestId("tutorial-modal")).not.toBeInTheDocument();
    });
});
