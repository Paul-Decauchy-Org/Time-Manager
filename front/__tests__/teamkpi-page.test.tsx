/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import TeamKpiPage from "@/app/dashboard/kpi/team/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { Role } from "@/generated/graphql";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const { useQuery } = require("@apollo/client/react");

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

describe("team kpi page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock utilisateur Manager par défaut
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          firstName: "Manager",
          lastName: "User",
          email: "manager@example.com",
          role: Role.Manager,
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it("should render the page", () => {
    const { container } = render(
      <AuthProvider>
        <TeamKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should render for Admin users", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "2",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <TeamKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should render for Manager users", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "3",
          role: Role.Manager,
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <TeamKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <TeamKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});