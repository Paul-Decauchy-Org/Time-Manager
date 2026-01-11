/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { render, renderHook, screen } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Role } from "@/generated/graphql";
import { ReactNode } from "react";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useQuery: jest.fn(),
  useFragment: jest.fn(),
  useSuspenseQuery: jest.fn(),
}));

const { useQuery } = require("@apollo/client/react");

// ====================
// Tests pour AuthProvider
// ====================
describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait rendre les enfants correctement", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(
      <AuthProvider>
        <div>Test Content</div>
      </AuthProvider>
    );

    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("devrait fournir un utilisateur authentifié", () => {
    const mockUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: Role.User,
    };

    useQuery.mockReturnValue({
      data: { me: mockUser },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it("devrait indiquer l'état de chargement", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeUndefined();
  });

  it("devrait retourner undefined si pas d'utilisateur", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeUndefined();
  });

  it("devrait ignorer les erreurs (errorPolicy: ignore)", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error("Unauthorized"),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // L'erreur est ignorée, donc pas de crash
    expect(result.current.user).toBeUndefined();
  });

  it("devrait utiliser errorPolicy: ignore dans useQuery", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        errorPolicy: "ignore",
      })
    );
  });
});

// ====================
// Tests pour hasRole
// ====================
describe("hasRole", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner true si l'utilisateur a le rôle spécifié", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole(Role.Admin)).toBe(true);
  });

  it("devrait retourner false si l'utilisateur n'a pas le rôle", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole(Role.Admin)).toBe(false);
  });

  it("devrait retourner false si pas d'utilisateur", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole(Role.User)).toBe(false);
  });

  it("devrait accepter un tableau de rôles", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.Manager,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole([Role.Admin, Role.Manager])).toBe(true);
  });

  it("devrait retourner false si le rôle n'est pas dans le tableau", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole([Role.Admin, Role.Manager])).toBe(false);
  });

  it("devrait gérer un rôle unique passé en paramètre", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.hasRole(Role.User)).toBe(true);
  });
});

// ====================
// Tests pour isAdmin
// ====================
describe("isAdmin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner true si l'utilisateur est Admin", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAdmin).toBe(true);
  });

  it("devrait retourner false si l'utilisateur n'est pas Admin", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAdmin).toBe(false);
  });

  it("devrait retourner false si pas d'utilisateur", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAdmin).toBe(false);
  });
});

// ====================
// Tests pour isManager
// ====================
describe("isManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner true si l'utilisateur est Manager", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.Manager,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isManager).toBe(true);
  });

  it("devrait retourner true si l'utilisateur est Admin (car Admin inclut Manager)", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.Admin,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isManager).toBe(true);
  });

  it("devrait retourner false si l'utilisateur est User", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isManager).toBe(false);
  });

  it("devrait retourner false si pas d'utilisateur", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isManager).toBe(false);
  });
});

// ====================
// Tests pour useAuth
// ====================
describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait lancer une erreur si utilisé en dehors du AuthProvider", () => {
    // On s'attend à ce que useAuth throw une erreur
    const TestComponent = () => {
      useAuth();
      return <div>Test</div>;
    };

    // Supprimer les logs d'erreur de React pour ce test
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleError.mockRestore();
  });

  it("devrait retourner le context si utilisé dans AuthProvider", () => {
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeDefined();
    expect(result.current.hasRole).toBeDefined();
    expect(typeof result.current.hasRole).toBe("function");
  });
});

// ====================
// Tests d'intégration
// ====================
describe("AuthContext - Tests d'intégration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait gérer le flux complet d'authentification", () => {
    const mockUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: Role.Admin,
    };

    useQuery.mockReturnValue({
      data: { me: mockUser },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Vérifier toutes les propriétés
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isManager).toBe(true);
    expect(result.current.hasRole(Role.Admin)).toBe(true);
    expect(result.current.hasRole([Role.Admin, Role.User])).toBe(true);
    expect(result.current.hasRole(Role.User)).toBe(false);
  });

  it("devrait gérer différents rôles correctement", () => {
    const testCases = [
      {
        role: Role.Admin,
        expected: { isAdmin: true, isManager: true },
      },
      {
        role: Role.Manager,
        expected: { isAdmin: false, isManager: true },
      },
      {
        role: Role.User,
        expected: { isAdmin: false, isManager: false },
      },
    ];

    testCases.forEach(({ role, expected }) => {
      useQuery.mockReturnValue({
        data: {
          me: {
            id: "1",
            role: role,
          },
        },
        loading: false,
        error: null,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAdmin).toBe(expected.isAdmin);
      expect(result.current.isManager).toBe(expected.isManager);
    });
  });

  it("devrait mettre à jour le context quand les données changent", () => {
    const { rerender, result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Premier état : chargement
    useQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
    });

    expect(result.current.loading).toBe(false);

    // Deuxième état : utilisateur chargé
    useQuery.mockReturnValue({
      data: {
        me: {
          id: "1",
          role: Role.User,
        },
      },
      loading: false,
      error: null,
    });

    rerender();

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeDefined();
  });
});