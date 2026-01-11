/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

jest.mock("@/contexts/AuthContext", () => ({
    useAuth: jest.fn(() => ({
        user: {
            id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "EMPLOYEE",
        },
        loading: false,
        isAdmin: false,
        isManager: false,
        hasRole: jest.fn(() => false),
    })),
}));

describe("Dashboard Page", () => {
    it("should render dashboard page", () => {
        const { container } = render(<DashboardPage />);
        expect(container).toBeInTheDocument();
    });
});
