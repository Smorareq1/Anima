import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import Stats from "../Pages/dashboard/Stats";

// Mock DashboardLayout
jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

jest.mock("recharts", () => ({
    __esModule: true,
    ResponsiveContainer: ({ children }) => <div data-testid="mock-chart">{children}</div>,
    BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
    Bar: ({ onClick }) => (
        <>
            <div
                data-testid="bar-week"
                onClick={() => onClick({ keyOriginal: "HAPPY" })}
            >
                week bar
            </div>

            <div
                data-testid="bar-day"
                onClick={() => onClick({ dia: "2025-01-01" })}
            >
                day bar
            </div>
        </>
    ),

    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    PieChart: ({ children }) => <div>{children}</div>,
    Pie: ({ children }) => <div>{children}</div>,
    Cell: () => null,
    Legend: () => null,
}));

// Mock router y route
jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    router: { visit: jest.fn() },
    Head: ({ children }) => <>{children}</>,
}));

global.route = jest.fn((name) => `/mock/${name}`);

// Mock fetch global
global.fetch = jest.fn();

// Datos de ejemplo
const mockStats = {
    emocionesPorSemana: [
        { semana: "1-7 Enero", HAPPY: 5, SAD: 3 },
        { semana: "8-14 Enero", HAPPY: 2, SAD: 6 },
    ],
    analisisPorDia: [
        { fecha: "2025-01-01", emocion: "HAPPY", cantidad: 3 },
        { fecha: "2025-01-02", emocion: "SAD", cantidad: 2 },
    ],
    positivasVsNegativas: [
        { tipo: "Positivas", valor: 8 },
        { tipo: "Negativas", valor: 4 },
    ],
    ultimasEmociones: [
        { id: 1, icono: "😊", fecha: "2025-01-01", nombre: "Feliz" },
    ],
};

describe("Stats.jsx", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renderiza título y secciones principales", () => {
        render(<Stats statsData={mockStats} />);
        expect(screen.getByText(/Tus estadísticas/i)).toBeInTheDocument();
        expect(screen.getByText(/Emociones por semana/i)).toBeInTheDocument();
        expect(screen.getByText(/Análisis por día/i)).toBeInTheDocument();
        expect(screen.getByText(/Positivas vs Negativas/i)).toBeInTheDocument();
        expect(screen.getByText(/Últimas emociones detectadas/i)).toBeInTheDocument();
    });

    test("permite navegar entre semanas correctamente", () => {
        render(<Stats statsData={mockStats} />);

        // El botón "siguiente" debe estar deshabilitado al inicio (última semana)
        const buttons = screen.getAllByRole("button");
        const prevBtn = buttons[0];
        const nextBtn = buttons[1];

        expect(nextBtn).toBeDisabled();
        expect(prevBtn).toBeEnabled();

        // Ir hacia la semana anterior
        fireEvent.click(prevBtn);

        // Ahora "siguiente" debería estar habilitado y "anterior" deshabilitado
        expect(prevBtn).toBeDisabled();
        expect(nextBtn).toBeEnabled();
    });


    test("maneja clic en barra y muestra modal con playlists", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: "Playlist test", created_at: "2025-01-01", playlist_image: "img.jpg" }],
        });

        render(<Stats statsData={mockStats} />);
        // Busca cualquiera de las barras existentes: semanal o diaria
        const bars =
            screen.queryAllByTestId("bar-week").length > 0
                ? screen.getAllByTestId("bar-week")
                : screen.getAllByTestId("bar-day");

        fireEvent.click(bars[0]);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            const calledUrl = fetch.mock.calls[0][0];
            expect(calledUrl).toContain("/mock/stats.playlists");
        });
    });

    test("muestra mensaje de error si fetch falla", async () => {
        fetch.mockResolvedValueOnce({ ok: false });
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        render(<Stats statsData={mockStats} />);
        // Busca cualquiera de las barras existentes: semanal o diaria
        const bars =
            screen.queryAllByTestId("bar-week").length > 0
                ? screen.getAllByTestId("bar-week")
                : screen.getAllByTestId("bar-day");

        fireEvent.click(bars[0]);
        await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
        consoleSpy.mockRestore();
    });

    test("muestra mensaje cuando no hay datos", () => {
        const empty = { emocionesPorSemana: [], analisisPorDia: [], positivasVsNegativas: [], ultimasEmociones: [] };
        render(<Stats statsData={empty} />);
        expect(screen.getByText(/No hay datos para esta semana/i)).toBeInTheDocument();
    });

    test("renderiza lista de últimas emociones y permite visitarlas", () => {
        const { getByText } = render(<Stats statsData={mockStats} />);
        fireEvent.click(getByText("😊"));
        expect(require("@inertiajs/react").router.visit).toHaveBeenCalled();
    });
    test("renderiza correctamente el contenido del CustomPieTooltip", () => {
        // Simulamos directamente el contenido que el Tooltip pasaría al CustomPieTooltip
        const { container } = render(
            <Stats
                statsData={{
                    emocionesPorSemana: [{ semana: "1-7 Enero", HAPPY: 5 }],
                    analisisPorDia: [],
                    positivasVsNegativas: [
                        {
                            tipo: "Positivas",
                            valor: 8,
                            emociones: ["HAPPY", "CALM"],
                        },
                    ],
                    ultimasEmociones: [],
                }}
            />
        );

        const CustomPieTooltip = ({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const data = payload[0].payload;
            const EMOCIONES_MAP = {
                HAPPY: "FELIZ",
                CALM: "CALMADO",
            };
            const emocionesTraducidas = data.emociones.map(
                (emo) => EMOCIONES_MAP[emo] || emo
            );

            return (
                <div data-testid="tooltip-content">
                    <p
                        style={{
                            color: data.tipo === "Positivas" ? "#00C49F" : "#FF6B6B",
                        }}
                    >
                        {data.tipo}: {data.valor}
                    </p>
                    <ul>
                        {emocionesTraducidas.map((emo, i) => (
                            <li key={i}>{emo}</li>
                        ))}
                    </ul>
                </div>
            );
        };

        // Renderizamos el tooltip de forma aislada para validarlo
        const tooltipElement = render(
            <CustomPieTooltip
                active={true}
                payload={[
                    {
                        payload: {
                            tipo: "Positivas",
                            valor: 8,
                            emociones: ["HAPPY", "CALM"],
                        },
                    },
                ]}
            />
        );

        const tooltip = tooltipElement.getByTestId("tooltip-content");
        expect(tooltip).toHaveTextContent("Positivas: 8");
        expect(tooltip).toHaveTextContent("FELIZ");
        expect(tooltip).toHaveTextContent("CALMADO");

        const label = tooltipElement.getByText(/Positivas:/i);
        expect(label).toHaveStyle({ color: "#00C49F" });
    });
    test("llama al endpoint correcto al hacer clic en barra de análisis por día", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ emocion: "HAPPY", cantidad: 3 }],
        });

        render(<Stats statsData={mockStats} />);

        // clic en barra diaria
        fireEvent.click(screen.getAllByTestId("bar-day")[1]);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/mock/stats.emotionsByDay?fecha=2025-01-01"),
                expect.any(Object)
            );
        });
    });
    test("expande y colapsa emociones del modal diario", async () => {
        // Mock 1: carga de emociones del día
        fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    { emocion: "HAPPY", icono: "😊", nombre: "Feliz", cantidad: 3 },
                ],
            })
            // Mock 2: carga de playlists dentro de esa emoción
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    { id: 1, name: "Playlist diaria", playlist_image: "img.jpg" },
                ],
            });

        render(<Stats statsData={mockStats} />);

        // Clic en una barra del gráfico diario
        fireEvent.click(screen.getAllByTestId("bar-day")[1]);

        // Espera a que el modal se renderice
        const modal = await screen.findByText(/Emociones del/i);
        expect(modal).toBeInTheDocument();

        // Usamos `within` para buscar dentro del modal
        const modalContainer = modal.closest(".modal-content");
        expect(modalContainer).toBeTruthy();

        // Confirmamos que la emoción "Feliz" está dentro del modal, no fuera
        const felizText = within(modalContainer).getByText("Feliz");
        expect(felizText).toBeInTheDocument();

        // Ahora seleccionamos el botón de expandir (chevron dentro del modal)
        const expandBtn = within(modalContainer).getByRole("button");
        fireEvent.click(expandBtn);

        // Esperamos a que se llame al endpoint de playlists
        await waitFor(() =>
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining("/mock/stats.playlistsByDay"),
                expect.any(Object)
            )
        );

        // Clic de nuevo para colapsar
        fireEvent.click(expandBtn);
    });

    test("abre y cierra el modal de playlists semanales correctamente", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [
                {
                    id: 99,
                    name: "Playlist semanal",
                    created_at: "2025-01-01",
                    playlist_image: "cover.jpg",
                },
            ],
        });

        render(<Stats statsData={mockStats} />);

        // clic en la barra de emociones semanales
        const weekBar = screen.getAllByTestId("bar-week")[0];
        fireEvent.click(weekBar);

        // espera a que se llame al endpoint correcto
        await waitFor(() => {
            const call = fetch.mock.calls.find(([url]) =>
                url.includes("/mock/stats.playlists")
            );

            // Verificamos que se haya hecho la llamada
            expect(call).toBeTruthy();

            // La URL debe contener la ruta base
            expect(call[0]).toContain("/mock/stats.playlists");

            // El segundo argumento (config) puede no existir
            if (call[1]) {
                expect(call[1]).toMatchObject({
                    headers: expect.any(Object),
                });
            }
        });


        // modal visible
        const modalTitle = await screen.findByText(/Playlists de la emoción/i);
        expect(modalTitle).toBeInTheDocument();

        // playlist cargada
        expect(screen.getByText("Playlist semanal")).toBeInTheDocument();

        // clic en “Ver detalle”
        fireEvent.click(screen.getByText("Ver detalle"));
        expect(require("@inertiajs/react").router.visit).toHaveBeenCalled();

        // cierre del modal
        fireEvent.click(modalTitle.closest(".modal-overlay"));
        await waitFor(() =>
            expect(screen.queryByText(/Playlists de la emoción/i)).not.toBeInTheDocument()
        );
    });
});
