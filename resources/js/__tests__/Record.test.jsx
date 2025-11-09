import React from "react";
import { render, screen } from "@testing-library/react";
import Record from "../Pages/dashboard/Record";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/history/PlaylistCard.jsx", () => ({
    __esModule: true,
    default: ({ name }) => <div data-testid="mock-playlistcard">{name}</div>,
}));

jest.mock("../Components/history/EmotionSummary.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-emotionsummary">EmotionSummary</div>,
}));

jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    Link: ({ href, children, ...props }) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
    router: {
        visit: jest.fn(),
    },
}));

jest.mock("ziggy-js", () => ({
    __esModule: true,
    route: (name) => `/mock/${name}`,
}));

describe("Componente Record", () => {
    const mockPlaylists = [
        { id: 1, name: "Playlist 1" },
        { id: 2, name: "Playlist 2" },
    ];
    const mockSummary = [{ emotion: "HAPPY", count: 3 }];
    const mockPagination = { total: 10, per_page: 5, current_page: 1 };

    test("muestra el título y el filtro de emociones", () => {
        render(
            <Record
                playlists={mockPlaylists}
                summaryData={mockSummary}
                pagination={mockPagination}
                currentEmotion=""
            />
        );

        expect(screen.getByText(/Tu historial de playlists/i)).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByText(/Todas las emociones/i)).toBeInTheDocument();
    });

    test("renderiza playlists cuando existen", () => {
        render(
            <Record
                playlists={mockPlaylists}
                summaryData={mockSummary}
                pagination={mockPagination}
                currentEmotion=""
            />
        );

        expect(screen.getAllByTestId("mock-playlistcard").length).toBe(2);
    });

    test("muestra mensaje vacío cuando no hay playlists", () => {
        render(
            <Record
                playlists={[]}
                summaryData={mockSummary}
                pagination={mockPagination}
                currentEmotion=""
            />
        );

        expect(
            screen.getByText(/No se han encontrado playlists/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/¡Comienza ahora!/i)).toBeInTheDocument();
    });

    test("muestra los componentes DashboardLayout y EmotionSummary", () => {
        render(
            <Record
                playlists={mockPlaylists}
                summaryData={mockSummary}
                pagination={mockPagination}
                currentEmotion=""
            />
        );

        expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("mock-emotionsummary")).toBeInTheDocument();
    });

    test("renderiza paginación correctamente", () => {
        render(
            <Record
                playlists={mockPlaylists}
                summaryData={mockSummary}
                pagination={mockPagination}
                currentEmotion=""
            />
        );

        const pages = screen.getAllByRole("link");
        expect(pages.length).toBeGreaterThan(0);
        expect(pages[0]).toHaveAttribute("href", expect.stringContaining("?page="));
    });
});
