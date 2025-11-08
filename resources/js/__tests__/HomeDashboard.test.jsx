import React from "react";
import { render, screen } from "@testing-library/react";
import HomeDashboard from "../Pages/dashboard/HomeDashboard";

// Mock de @inertiajs/react con función configurable
let mockUsePage = jest.fn(() => ({
    props: {
        auth: { user: { first_name: "UsuarioTest", username: "user_test" } },
        playlistData: null,
        mustCompleteProfile: false,
    },
}));

jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    usePage: (...args) => mockUsePage(...args),
}));

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/history/PlaylistCard.jsx", () => ({
    __esModule: true,
    default: ({ name }) => <div data-testid="mock-playlistcard">{name}</div>,
}));

jest.mock("../Components/modal/PlaylistModal.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-playlistmodal">PlaylistModal</div>,
}));

jest.mock("../Components/modal/CompleteProfileModal.jsx", () => ({
    __esModule: true,
    default: () => (
        <div data-testid="mock-completeprofilemodal">CompleteProfileModal</div>
    ),
}));

describe("Componente HomeDashboard", () => {
    const mockRecientes = {
        ultimasCanciones: [
            {
                id: 1,
                titulo: "Canción A",
                artista: "Artista A",
                album: "Álbum A",
                duracion: "3:20",
                imagen: "/img/a.jpg",
            },
        ],
        ultimasPlaylists: [
            { id: 1, name: "Playlist 1" },
            { id: 2, name: "Playlist 2" },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reiniciamos el mock para el caso base
        mockUsePage = jest.fn(() => ({
            props: {
                auth: { user: { first_name: "UsuarioTest", username: "user_test" } },
                playlistData: null,
                mustCompleteProfile: false,
            },
        }));
    });

    test("muestra el título, subtítulo y las secciones principales", () => {
        render(<HomeDashboard recientesData={mockRecientes} />);

        expect(screen.getByText(/Bienvenido, UsuarioTest/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Tus últimas playlists analizadas/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Tus últimas canciones recomendadas/i)
        ).toBeInTheDocument();
    });

    test("renderiza playlists y canciones recientes", () => {
        render(<HomeDashboard recientesData={mockRecientes} />);

        expect(screen.getAllByTestId("mock-playlistcard").length).toBe(2);
        expect(screen.getByText(/Canción A/i)).toBeInTheDocument();
        expect(screen.getByText(/Artista A/i)).toBeInTheDocument();
    });

    test("muestra mensaje si no hay playlists ni canciones", () => {
        const emptyData = { ultimasCanciones: [], ultimasPlaylists: [] };
        render(<HomeDashboard recientesData={emptyData} />);

        expect(
            screen.getByText(/No hay playlists recientes/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/No tienes canciones favoritas/i)
        ).toBeInTheDocument();
    });

    test("muestra CompleteProfileModal si mustCompleteProfile es true", () => {
        mockUsePage = jest.fn(() => ({
            props: {
                auth: { user: { first_name: "UsuarioTest" } },
                playlistData: null,
                mustCompleteProfile: true,
            },
        }));

        render(<HomeDashboard recientesData={mockRecientes} />);
        expect(
            screen.getByTestId("mock-completeprofilemodal")
        ).toBeInTheDocument();
    });
});
