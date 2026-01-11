/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import LoginLink from "@/components/links/login-link";

describe("LoginLink", () => {
    it("should render login link", () => {
        render(<LoginLink />);
        expect(screen.getByText("Connexion")).toBeInTheDocument();
    });

    it("should have correct href", () => {
        render(<LoginLink />);
        const link = screen.getByText("Connexion");
        expect(link).toHaveAttribute("href", "/login");
    });

    it("should have correct styling classes", () => {
        render(<LoginLink />);
        const link = screen.getByText("Connexion");
        expect(link).toHaveClass("text-sm", "font-medium", "text-primary");
    });
});
