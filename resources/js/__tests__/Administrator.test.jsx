import React from "react";
import { render, screen } from "@testing-library/react";
import Administrator from "../Pages/dashboard/Administrator";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/RecommendedSongs.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-recommendedsongs">RecommendedSongs</div>,
}));

jest.mock("../Components/ChartCard.jsx", () => ({
    __esModule: true,
    default: ({ title }) => <div data-testid="mock-chartcard">{title}</div>,
}));

describe("Componente Administrator", () => {
    const mockDashboard = {
        usuarioMasActivo: {
            nombre: "Usuario Test",
            imagen: "/img/user.png",
        },
        cancionMasEscuchada: {
            titulo: "Canción Test",
            artista: "Artista Test",
            imagen: "/img/song.png",
        },
        emocionMasPopular: {
            nombre: "Feliz",
            icono: "😊",
        },
        cancionesRecomendadas: [{ id: 1, titulo: "Track A" }],
        usuariosActivos: [{ id: 1, valor: 10 }],
        emocionesPopulares: [{ id: 1, valor: 5 }],
        usuariosSpotify: [{ id: 1, valor: 3 }],
    };

    test("muestra el título principal y las secciones", () => {
        render(<Administrator dashboardData={mockDashboard} />);

        expect(screen.getByText(/Panel de Administrador/i)).toBeInTheDocument();
        expect(screen.getByText(/Resumen/i)).toBeInTheDocument();
        expect(screen.getByText(/Usuario más activo/i)).toBeInTheDocument();
        expect(screen.getByText(/Canción más escuchada/i)).toBeInTheDocument();
        expect(screen.getByText(/Emoción más popular/i)).toBeInTheDocument();
    });

    test("renderiza los componentes del layout y los gráficos", () => {
        render(<Administrator dashboardData={mockDashboard} />);

        expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("mock-recommendedsongs")).toBeInTheDocument();

        const charts = screen.getAllByTestId("mock-chartcard");
        expect(charts.length).toBe(3);
        expect(screen.getByText(/Usuarios Activos/i)).toBeInTheDocument();
        expect(screen.getByText(/Emociones más populares/i)).toBeInTheDocument();
        expect(screen.getByText(/Usuarios con Spotify/i)).toBeInTheDocument();
    });

    test("muestra correctamente los datos del resumen", () => {
        render(<Administrator dashboardData={mockDashboard} />);

        expect(screen.getByText("Usuario Test")).toBeInTheDocument();
        expect(screen.getByText(/Canción Test - Artista Test/i)).toBeInTheDocument();
        expect(screen.getByText("Feliz")).toBeInTheDocument();
    });
});
