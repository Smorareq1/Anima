import React from "react";
import { render, screen } from "@testing-library/react";
import EmotionUpload from "../Components/EmotionUpload";

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
    default: () => <div data-testid="loading-screen">Loading...</div>,
}));

describe("Componente EmotionUpload", () => {
    test("renderiza los elementos principales", () => {
        render(<EmotionUpload />);

        expect(screen.getByText(/Max 10MB, PNG, JPEG, JPG/i)).toBeInTheDocument();
        expect(screen.getByText(/Generar recomendación/i)).toBeInTheDocument();
        expect(screen.getByTestId("loading-screen")).toBeInTheDocument();
        expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
});
