/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import UserKpiPage from "@/app/dashboard/kpi/user/page";
import { AuthProvider } from "@/contexts/AuthContext";
import { Role } from "@/generated/graphql";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const { useQuery: useQueryUser } = require("@apollo/client/react");

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

describe("user kpi page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock utilisateur standard par défaut
    useQueryUser.mockReturnValue({
      data: {
        me: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          role: Role.User,
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
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should render for regular User", () => {
    useQueryUser.mockReturnValue({
      data: {
        me: {
          id: "2",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should render for Manager", () => {
    useQueryUser.mockReturnValue({
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
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should render for Admin", () => {
    useQueryUser.mockReturnValue({
      data: {
        me: {
          id: "4",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    useQueryUser.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it("should handle unauthenticated state", () => {
    useQueryUser.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(
      <AuthProvider>
        <UserKpiPage />
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});