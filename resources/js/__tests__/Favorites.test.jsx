import React from "react";
import { render, screen } from "@testing-library/react";
import Favorites from "../Pages/dashboard/Favorites";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/history/PlaylistCard.jsx", () => ({
    __esModule: true,
    default: ({ name }) => <div data-testid="mock-playlistcard">{name}</div>,
}));

describe("Componente Favorites", () => {
    const mockFavoritos = {
        playlistsFavoritas: [
            { id: 1, name: "Playlist 1" },
            { id: 2, name: "Playlist 2" },
        ],
        cancionesFavoritas: [
            {
                id: 1,
                titulo: "Canción A",
                artista: "Artista A",
                album: "Álbum A",
                duracion: "3:45",
                imagen: "/img/a.jpg",
                spotify_url: "https://open.spotify.com/track/123",
            },
        ],
    };

    test("muestra el título principal y secciones de playlists y canciones", () => {
        render(<Favorites favoritosData={mockFavoritos} />);

        expect(
            screen.getByText(/Revive lo que más te hizo sentir/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Playlists/i)).toBeInTheDocument();
        expect(screen.getByText(/Canciones/i)).toBeInTheDocument();
    });

    test("renderiza playlists favoritas cuando existen", () => {
        render(<Favorites favoritosData={mockFavoritos} />);
        expect(screen.getAllByTestId("mock-playlistcard").length).toBe(2);
    });

    test("renderiza canciones favoritas cuando existen", () => {
        render(<Favorites favoritosData={mockFavoritos} />);

        expect(screen.getByText(/Canción A/i)).toBeInTheDocument();
        expect(screen.getByText(/Artista A/i)).toBeInTheDocument();
        expect(screen.getByText(/Álbum A/i)).toBeInTheDocument();
        expect(screen.getByText(/3:45/i)).toBeInTheDocument();
        expect(screen.getByText(/Ir a Spotify/i)).toBeInTheDocument();
    });

    test("muestra mensajes vacíos cuando no hay playlists ni canciones", () => {
        const emptyData = { playlistsFavoritas: [], cancionesFavoritas: [] };
        render(<Favorites favoritosData={emptyData} />);

        expect(
            screen.getByText(/No tienes playlists favoritas todavía/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/No tienes canciones favoritas todavía/i)
        ).toBeInTheDocument();
    });

    test("renderiza el DashboardLayout", () => {
        render(<Favorites favoritosData={mockFavoritos} />);
        expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
    });
});
