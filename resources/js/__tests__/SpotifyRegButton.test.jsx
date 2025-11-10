import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpotifyButton from "../Components/SpotifyRegButton";

global.route = jest.fn(() => "/spotify/redirect");

beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((...args) => {
        if (typeof args[0] === "string" && args[0].includes("Not implemented: navigation")) {
            return;
        }
    });
});

describe("SpotifyButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.location.href = "";
    });

    test("renderiza el botón con texto cuando no está vinculado", () => {
        render(<SpotifyButton disabled={false} />);
        const button = screen.getByRole("button", { name: /utiliza anima con spotify/i });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
    });

    test("renderiza el texto 'Spotify vinculado' cuando está deshabilitado", () => {
        render(<SpotifyButton disabled={true} />);
        const button = screen.getByRole("button", { name: /spotify vinculado/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    test("redirige al hacer clic si no está deshabilitado", async () => {
        const user = userEvent.setup();
        render(<SpotifyButton disabled={false} />);
        const button = screen.getByRole("button");
        await user.click(button);
        expect(global.route).toHaveBeenCalledWith("spotify.redirect");
    });

});
