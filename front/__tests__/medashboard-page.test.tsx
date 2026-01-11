/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Mock Apollo
jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const { useQuery } = require("@apollo/client/react");

describe("Me Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait afficher les informations utilisateur", async () => {
    useQuery.mockReturnValue({
      data: { 
        me: {
          id: "1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
        }
      },
      loading: false,
      error: null,
    });

    // Crée un composant de test qui simule ta page
    const TestComponent = () => {
      const { user } = useAuth();
      
      if (!user) return <div>Not logged in</div>;
      
      return (
        <div data-testid="user-profile">
          <h1>{user.firstName} {user.lastName}</h1>
          <p>{user.email}</p>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-profile")).toBeInTheDocument();
    });
  });
});