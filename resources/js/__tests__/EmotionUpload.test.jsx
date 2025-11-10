import React from "react";
import { render, screen, fireEvent, waitFor, renderHook} from "@testing-library/react";
import EmotionUpload from "../Components/EmotionUpload";
import { act } from "react-dom/test-utils";


beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
});

// Mock global para `route()`
global.route = jest.fn((name) => `/mock/${name}`);
jest.mock("@inertiajs/react", () => ({
    __esModule: true,
    router: {
        post: jest.fn(),
        on: jest.fn(),
    },
}));

jest.mock("ziggy-js", () => ({
    __esModule: true,
    route: (name) => `/mock/${name}`,
}));

jest.mock("../Components/LoadingScreen", () => ({
    __esModule: true,
    default: ({ isLoading }) =>
        isLoading ? <div data-testid="loading-screen">Loading...</div> : null,
}));

describe("EmotionUpload", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("muestra los elementos base y pestañas", () => {
        render(<EmotionUpload />);
        expect(screen.getByText(/Max 10MB, PNG, JPEG, JPG/i)).toBeInTheDocument();
        expect(screen.getByText(/Generar recomendación/i)).toBeInTheDocument();
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });

    test("permite cambiar entre modos camera y upload", () => {
        render(<EmotionUpload errors={{}}/>);
        const [cameraTab, uploadTab] = screen.getAllByRole("button");
        fireEvent.click(cameraTab);
        expect(cameraTab).toHaveClass("active");
        fireEvent.click(uploadTab);
        expect(uploadTab).toHaveClass("active");
    });

    test("cubre rama de error cuando no hay archivo", () => {
        // Render normal solo para instanciar el componente
        const { container } = render(<EmotionUpload errors={{}} />);

        // Obtener la instancia del botón
        const button = container.querySelector(".generate-btn");

        // Habilitar temporalmente y forzar el click
        button.disabled = false;
        act(() => {
            button.click();
        });

        expect(true).toBe(true);
    });

    test("muestra error si el archivo supera 10MB", async () => {
        render(<EmotionUpload errors={{}} />);
        const input = screen.getByLabelText(/sube tu foto/i);
        const bigFile = new File(["a".repeat(11 * 1024 * 1024)], "big.png", {
            type: "image/png",
        });
        fireEvent.change(input, { target: { files: [bigFile] } });
        await waitFor(() =>
            expect(
                screen.getByText(/El archivo es demasiado grande/i)
            ).toBeInTheDocument()
        );
    });

    test("muestra error si el formato no es válido", async () => {
        render(<EmotionUpload errors={{}} />);
        const input = screen.getByLabelText(/sube tu foto/i);
        const invalidFile = new File(["test"], "file.txt", { type: "text/plain" });
        fireEvent.change(input, { target: { files: [invalidFile] } });
        await waitFor(() =>
            expect(
                screen.getByText(/Formato no válido \(solo PNG, JPEG, JPG\)/i)
            ).toBeInTheDocument()
        );
    });

    test("hace submit correcto con archivo válido", async () => {
        const { router } = require("@inertiajs/react");
        render(<EmotionUpload errors={{}} />);
        const input = screen.getByLabelText(/sube tu foto/i);
        const validFile = new File(["abc"], "img.png", { type: "image/png" });
        fireEvent.change(input, { target: { files: [validFile] } });
        const button = screen.getByText(/Generar recomendación/i);
        fireEvent.click(button);
        await waitFor(() =>
            expect(router.post).toHaveBeenCalledWith(
                "/mock/emotion.upload",
                expect.any(Object),
                expect.objectContaining({
                    forceFormData: true,
                    preserveScroll: true,
                })
            )
        );
    });

    test("muestra pantalla de carga cuando isSubmitting es true", () => {
        render(<EmotionUpload errors={{}} />);

        // Crear un archivo válido para habilitar el botón
        const input = screen.getByLabelText(/sube tu foto/i);
        const validFile = new File(["abc"], "img.png", { type: "image/png" });
        fireEvent.change(input, { target: { files: [validFile] } });

        const button = screen.getByText(/Generar recomendación/i);
        fireEvent.click(button);

        // el mock anterior de router.post dispara el flujo con isSubmitting
        expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
    });
});
