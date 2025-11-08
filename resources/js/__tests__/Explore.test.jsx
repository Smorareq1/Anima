import React from "react";
import { render, screen } from "@testing-library/react";
import Explore from "../Pages/dashboard/Explore";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/history/PlaylistCard.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-playlistcard">PlaylistCard</div>,
}));

jest.mock("../Pages/PlaylistCarousel.jsx", () => ({
    __esModule: true,
    default: ({ tracks }) => (
        <div data-testid="mock-carousel">
            {tracks?.length ? `Tracks: ${tracks.length}` : "No tracks"}
        </div>
    ),
}));

describe("Componente Explore", () => {
    const mockExplorarData = {
        playlistRecomendada: [],
        cancionesRecomendadas: [
            { id: 1, titulo: "Canción X" },
            { id: 2, titulo: "Canción Y" },
        ],
    };

    test("muestra los textos principales de la página", () => {
        render(<Explore explorarData={mockExplorarData} />);

        expect(screen.getByText(/Explora nueva música/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Descubrí música aleatoria que quizá no conocías/i)
        ).toBeInTheDocument();
    });

    test("renderiza el carrusel cuando hay canciones recomendadas", () => {
        render(<Explore explorarData={mockExplorarData} />);
        expect(screen.getByTestId("mock-carousel")).toBeInTheDocument();
        expect(screen.getByText(/Tracks: 2/i)).toBeInTheDocument();
    });

    test("muestra mensaje vacío cuando no hay canciones recomendadas", () => {
        const emptyData = { playlistRecomendada: [], cancionesRecomendadas: [] };
        render(<Explore explorarData={emptyData} />);

        expect(
            screen.getByText(/No hay canciones disponibles en este momento/i)
        ).toBeInTheDocument();
    });
});
