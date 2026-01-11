/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import SignupLink from "@/components/links/signup-link";

jest.mock("next/link", () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => {
        return <a href={ href }> { children } </a>;
    };
});

describe("SignupLink", () => {
    it("should render signup link", () => {
        render(<SignupLink />);
        expect(screen.getByText("Créer un compte")).toBeInTheDocument();
    });

    it("should have correct href", () => {
        render(<SignupLink />);
        const link = screen.getByText("Créer un compte");
        expect(link).toHaveAttribute("href", "/signup");
    });

    it("should have correct styling classes", () => {
        render(<SignupLink />);
        const link = screen.getByText("Créer un compte");
        expect(link).toHaveClass("text-sm", "font-medium", "text-primary");
    });
});
