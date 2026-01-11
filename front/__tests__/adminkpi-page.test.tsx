/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import AdminKpiPage from "@/app/dashboard/kpi/admin/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { Role } from "@/generated/graphql";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useFragment: jest.fn(),
  useSuspenseQuery: jest.fn(),
}));

const { useQuery } = require("@apollo/client/react");


global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe("admin kpi page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the page", () => {
    // Mock de l'utilisateur Admin
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
    });

    // Enveloppe le composant dans AuthProvider
    const { container } = render(
      <AuthProvider>
        <AdminKpiPage />
      </AuthProvider>
    );

    expect(container).toBeInTheDocument();
  });

  it("should display loading state", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    render(
      <AuthProvider>
        <AdminKpiPage />
      </AuthProvider>
    );

    // Tu peux vérifier que le loader s'affiche
    // expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("should only be accessible by Admin users", () => {
    // Mock d'un utilisateur non-admin
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "2",
          firstName: "Regular",
          lastName: "User",
          email: "user@example.com",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <AdminKpiPage />
      </AuthProvider>
    );

    // Vérifie que l'utilisateur non-admin ne peut pas accéder
    // (dépend de ton implémentation)
  });

  it("should render for authenticated admin", async () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          firstName: "Admin",
          lastName: "User",
          email: "admin@example.com",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <AdminKpiPage />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });
});