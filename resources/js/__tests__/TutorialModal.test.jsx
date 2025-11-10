import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TutorialModal from "../Components/modal/TutorialModal";

// Mock del botón de Spotify
jest.mock("../Components/SpotifyRegButton.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="spotify-button">Spotify Button</div>,
}));

describe("TutorialModal", () => {
    test("no se renderiza si isOpen es false", () => {
        render(<TutorialModal isOpen={false} onClose={jest.fn()} />);
        expect(screen.queryByText(/Llevá ÁNIMA a otro nivel con Spotify/i)).toBeNull();
    });

    test("se renderiza correctamente cuando isOpen es true", () => {
        render(<TutorialModal isOpen={true} onClose={jest.fn()} />);
        expect(
            screen.getByText(/Llevá ÁNIMA a otro nivel con Spotify/i)
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "×" })).toBeInTheDocument();
        expect(screen.getByTestId("spotify-button")).toBeInTheDocument();
        expect(screen.getByTitle(/Tutorial de Ánima/i)).toHaveAttribute(
            "src",
            expect.stringContaining("youtube.com")
        );
    });

    test("ejecuta onClose al hacer clic en el overlay", () => {
        const onCloseMock = jest.fn();
        render(<TutorialModal isOpen={true} onClose={onCloseMock} />);
        const overlay = screen.getByRole("button", { hidden: true }) || screen.getByText(/Llevá ÁNIMA/i).closest(".modal-overlay");
        fireEvent.click(overlay);
        expect(onCloseMock).toHaveBeenCalled();
    });

    test("ejecuta onClose al hacer clic en el botón de cierre", () => {
        const onCloseMock = jest.fn();
        render(<TutorialModal isOpen={true} onClose={onCloseMock} />);
        const closeBtn = screen.getByRole("button", { name: "×" });
        fireEvent.click(closeBtn);
        expect(onCloseMock).toHaveBeenCalled();
    });

    test("no ejecuta onClose al hacer clic dentro del modal", () => {
        const onCloseMock = jest.fn();
        render(<TutorialModal isOpen={true} onClose={onCloseMock} />);
        const modal = screen.getByText(/Llevá ÁNIMA/i).closest(".modal");
        fireEvent.click(modal);
        expect(onCloseMock).not.toHaveBeenCalled();
    });
});
