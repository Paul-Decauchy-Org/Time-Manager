/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import { useLogin } from "@/hooks/login";
import { useSignUp } from "@/hooks/signup";
import { useClockIn } from "@/hooks/clockin";
import { useClockOut } from "@/hooks/clockout";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useUserKpi } from "@/hooks/useUserKpi";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

const { useMutation, useQuery } = require("@apollo/client/react");

// ====================
// Tests pour useLogin
// ====================
describe("useLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait effectuer une connexion avec succès", async () => {
    const mockLoginMutation = jest.fn().mockResolvedValue({
      data: {
        login: {
          id: "1",
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      },
    });

    useMutation.mockReturnValue([
      mockLoginMutation,
      { data: null, loading: false, error: null },
    ]);

    const { result } = renderHook(() => useLogin());

    const loginResult = await result.current.login(
      "test@example.com",
      "password123"
    );

    expect(mockLoginMutation).toHaveBeenCalledWith({
      variables: { email: "test@example.com", password: "password123" },
    });
    expect(loginResult).toEqual({
      id: "1",
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
    });
  });

  it("devrait gérer les erreurs de connexion", async () => {
    const mockError = new Error("Invalid credentials");
    const mockLoginMutation = jest.fn().mockRejectedValue(mockError);

    useMutation.mockReturnValue([
      mockLoginMutation,
      { data: null, loading: false, error: mockError },
    ]);

    const { result } = renderHook(() => useLogin());

    await expect(
      result.current.login("wrong@example.com", "wrongpass")
    ).rejects.toThrow("Invalid credentials");
  });

  it("devrait indiquer l'état de chargement", () => {
    useMutation.mockReturnValue([
      jest.fn(),
      { data: null, loading: true, error: null },
    ]);

    const { result } = renderHook(() => useLogin());

    expect(result.current.loading).toBe(true);
  });
});

// ====================
// Tests pour useSignUp
// ====================
describe("useSignUp", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait créer un compte avec succès", async () => {
    const userInput = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      phone: "0612345678",
      password: "securepass123",
    };

    const mockSignUpMutation = jest.fn().mockResolvedValue({
      data: {
        signUp: {
          id: "2",
          email: "jane@example.com",
          firstName: "Jane",
          lastName: "Doe",
        },
      },
    });

    useMutation.mockReturnValue([
      mockSignUpMutation,
      { data: null, loading: false, error: null },
    ]);

    const { result } = renderHook(() => useSignUp());

    const signUpResult = await result.current.signUp(userInput);

    expect(mockSignUpMutation).toHaveBeenCalledWith({
      variables: { input: userInput },
    });
    expect(signUpResult).toEqual({
      id: "2",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Doe",
    });
  });

  it("devrait retourner les données de la mutation", () => {
    const mockData = {
      signUp: {
        id: "2",
        email: "jane@example.com",
      },
    };

    useMutation.mockReturnValue([
      jest.fn(),
      { data: mockData, loading: false, error: null },
    ]);

    const { result } = renderHook(() => useSignUp());

    expect(result.current.data).toEqual(mockData);
  });
});

// ====================
// Tests pour useClockIn
// ====================
describe("useClockIn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait pointer l'arrivée avec succès", async () => {
    const mockClockInMutation = jest.fn().mockResolvedValue({
      data: {
        clockIn: {
          id: "entry1",
          startTime: "2025-01-11T08:00:00Z",
        },
      },
    });

    useMutation.mockReturnValue([
      mockClockInMutation,
      { data: null, loading: false, error: null },
    ]);

    const { result } = renderHook(() => useClockIn());

    const clockInResult = await result.current.clockIn();

    expect(mockClockInMutation).toHaveBeenCalled();
    expect(clockInResult).toEqual({
      clockIn: {
        id: "entry1",
        startTime: "2025-01-11T08:00:00Z",
      },
    });
  });
});

// ====================
// Tests pour useClockOut
// ====================
describe("useClockOut", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait pointer la sortie avec succès", async () => {
    const mockClockOutMutation = jest.fn().mockResolvedValue({
      data: {
        clockOut: {
          id: "entry1",
          endTime: "2025-01-11T17:00:00Z",
        },
      },
    });

    useMutation.mockReturnValue([
      mockClockOutMutation,
      { data: null, loading: false, error: null },
    ]);

    const { result } = renderHook(() => useClockOut());

    const clockOutResult = await result.current.clockOut();

    expect(mockClockOutMutation).toHaveBeenCalled();
    expect(clockOutResult).toEqual({
      clockOut: {
        id: "entry1",
        endTime: "2025-01-11T17:00:00Z",
      },
    });
  });
});

// ====================
// Tests pour useTimeEntries
// ====================
describe("useTimeEntries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait récupérer les entrées de temps", async () => {
    const mockData = {
      timeTableEntries: [
        {
          id: "1",
          startTime: "2025-01-11T08:00:00Z",
          endTime: "2025-01-11T17:00:00Z",
        },
        {
          id: "2",
          startTime: "2025-01-10T08:00:00Z",
          endTime: "2025-01-10T16:00:00Z",
        },
      ],
    };

    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useTimeEntries());

    expect(result.current.timeEntries).toHaveLength(2);
    expect(result.current.loading).toBe(false);
    expect(result.current.timeEntries[0].id).toBe("1");
  });

  it("devrait retourner un tableau vide si aucune entrée", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useTimeEntries());

    expect(result.current.timeEntries).toHaveLength(0);
  });

  it("devrait gérer l'état de chargement", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useTimeEntries());

    expect(result.current.loading).toBe(true);
  });

  it("devrait permettre de refetch les données", () => {
    const mockRefetch = jest.fn();

    useQuery.mockReturnValue({
      data: { timeTableEntries: [] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useTimeEntries());

    result.current.refetch();

    expect(mockRefetch).toHaveBeenCalled();
  });
});

// ====================
// Tests pour useUserKpi
// ====================
describe("useUserKpi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait calculer correctement la plage de dates pour 30d", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useUserKpi({ userID: "user1" }));

    expect(result.current.preset).toBe("30d");
    expect(result.current.from).toBeDefined();
    expect(result.current.to).toBeDefined();
  });

  it("devrait calculer correctement la plage pour 7d", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() =>
      useUserKpi({ userID: "user1", preset: "7d" })
    );

    expect(result.current.preset).toBe("7d");
  });

  it("devrait récupérer les KPI utilisateur", () => {
    const mockData = {
      kpiUserSummary: {
        totalHours: 160,
        daysWorked: 20,
        averageHoursPerDay: 8,
        workedMinutes: 160*60
      },
    };

    useQuery.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() =>
      useUserKpi({
        userID: "user1",
        from: "2024-12-12",
        to: "2025-01-11",
      })
    );

    expect(result.current.summary).toBeDefined();
    expect(result.current.summary?.workedMinutes).toBe(160*60);
    expect(result.current.loading).toBe(false);
  });

  it("ne devrait pas faire de requête si userID n'est pas fourni", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useUserKpi({}));

    expect(result.current.summary).toBeUndefined();
    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ skip: true })
    );
  });

  it("devrait utiliser les dates personnalisées si fournies", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() =>
      useUserKpi({
        userID: "user1",
        from: "2025-01-01",
        to: "2025-01-10",
      })
    );

    expect(result.current.from).toBe("2025-01-01");
    expect(result.current.to).toBe("2025-01-10");
  });
});

// ====================
// Tests pour useIsMobile
// ====================
describe("useIsMobile", () => {
  let matchMediaMock: jest.Mock;

  beforeEach(() => {
    matchMediaMock = jest.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: matchMediaMock,
    });
  });

  it("devrait détecter un écran mobile", () => {
    const listeners: Array<() => void> = [];
    
    matchMediaMock.mockImplementation((query) => ({
      matches: true,
      media: query,
      addEventListener: jest.fn((event, callback) => {
        listeners.push(callback);
      }),
      removeEventListener: jest.fn(),
    }));

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it("devrait détecter un écran desktop", () => {
    matchMediaMock.mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });
});