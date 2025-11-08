import React from "react";
import { render, screen } from "@testing-library/react";
import Recommend from "../Pages/dashboard/Recommend";

jest.mock("../Layout/DashboardLayout.jsx", () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="mock-dashboard">{children}</div>,
}));

jest.mock("../Components/EmotionUpload.jsx", () => ({
    __esModule: true,
    default: () => <div data-testid="mock-emotionupload">EmotionUpload</div>,
}));

jest.mock("ziggy-js", () => ({
    __esModule: true,
    route: (name) => `/mock/${name}`,
}));

describe("Componente Recommend", () => {
    test("muestra los textos principales de la sección", () => {
        render(<Recommend />);

        expect(screen.getByText(/Subí tu foto/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Dejanos traducir tus emociones en una playlist perfecta/i)
        ).toBeInTheDocument();
    });

    test("renderiza DashboardLayout y EmotionUpload", () => {
        render(<Recommend />);

        expect(screen.getByTestId("mock-dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("mock-emotionupload")).toBeInTheDocument();
    });
});
