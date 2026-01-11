/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "@/components/site-header";

jest.mock("@/components/ui/sidebar", () => ({
    SidebarTrigger: ({ className }: { className?: string }) => (
        <button className= { className } > Toggle Sidebar</ button >
  ),
}));

describe("SiteHeader", () => {
    it("should render site header component", () => {
        const { container } = render(<SiteHeader />);
        expect(container).toBeInTheDocument();
    });

    it("should render sidebar trigger", () => {
        render(<SiteHeader />);
        expect(screen.getByText("Toggle Sidebar")).toBeInTheDocument();
    });

    it("should display Documents title", () => {
        render(<SiteHeader />);
        expect(screen.getByText("Documents")).toBeInTheDocument();
    });

    it("should render GitHub link", () => {
        render(<SiteHeader />);
        expect(screen.getByText("GitHub")).toBeInTheDocument();
    });

    it("should have correct link href", () => {
        render(<SiteHeader />);
        const link = screen.getByText("GitHub").closest("a");
        expect(link).toHaveAttribute(
            "href",
            "https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
        );
    });

    it("should open GitHub link in new tab", () => {
        render(<SiteHeader />);
        const link = screen.getByText("GitHub").closest("a");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
