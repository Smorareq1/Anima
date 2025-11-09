import React from "react";
import { render, screen } from "@testing-library/react";
import Stats from "../Pages/dashboard/Stats";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("recharts", () => ({
    __esModule: true,
    ResponsiveContainer: ({ children }) => <div data-testid="mock-recharts">{children}</div>,
    BarChart: ({ children }) => <div data-testid="mock-barchart">{children}</div>,
    Bar: () => <div data-testid="mock-bar" />,
    CartesianGrid: () => <div data-testid="mock-grid" />,
    XAxis: () => <div data-testid="mock-xaxis" />,
    YAxis: () => <div data-testid="mock-yaxis" />,
    Tooltip: () => <div data-testid="mock-tooltip" />,
    PieChart: ({ children }) => <div data-testid="mock-piechart">{children}</div>,
    Pie: ({ children }) => <div data-testid="mock-pie">{children}</div>,
    Cell: () => <div data-testid="mock-cell" />,
    Legend: () => <div data-testid="mock-legend" />,
}));

jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    Head: ({ children }) => <>{children}</>,
    router: { visit: jest.fn() },
}));

jest.mock("ziggy-js", () => ({
    __esModule: true,
    route: (name) => `/mock/${name}`,
}));

describe("Componente Stats", () => {
    const mockStats = {
        emocionesPorSemana: [
            { semana: "1-7 Enero", HAPPY: 5, SAD: 2 },
            { semana: "8-14 Enero", HAPPY: 3, SAD: 4 },
        ],
        analisisPorDia: [
            { dia: "2025-01-01", cantidad: 4 },
            { dia: "2025-01-02", cantidad: 2 },
        ],
        positivasVsNegativas: [
            { tipo: "Positivas", valor: 8 },
            { tipo: "Negativas", valor: 4 },
        ],
        ultimasEmociones: [
            { id: 1, icono: "😊", fecha: "2025-01-01", nombre: "Feliz" },
        ],
    };

    test("muestra el título principal y secciones de estadísticas", () => {
        render(<Stats statsData={mockStats} />);

        expect(screen.getByText(/Tus estadísticas/i)).toBeInTheDocument();
        expect(screen.getByText(/Emociones por semana/i)).toBeInTheDocument();
        expect(screen.getByText(/Análisis por día/i)).toBeInTheDocument();
        expect(screen.getByText(/Positivas vs Negativas/i)).toBeInTheDocument();
        expect(screen.getByText(/Últimas emociones detectadas/i)).toBeInTheDocument();
    });

    test("renderiza DashboardLayout y componentes de recharts", () => {
        render(<Stats statsData={mockStats} />);

        expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
        expect(screen.getAllByTestId("mock-recharts").length).toBeGreaterThan(0);
    });

    test("muestra mensaje cuando no hay datos para la semana", () => {
        const emptyStats = {
            emocionesPorSemana: [],
            analisisPorDia: [],
            positivasVsNegativas: [],
            ultimasEmociones: [],
        };

        render(<Stats statsData={emptyStats} />);
        expect(screen.getByText(/No hay datos para esta semana/i)).toBeInTheDocument();
    });
});
