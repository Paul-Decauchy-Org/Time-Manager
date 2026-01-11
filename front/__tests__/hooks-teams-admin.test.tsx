/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useAdminUsers,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminUser,
  useAdminDeleteUser,
} from "@/hooks/admin/users";
import { useTeams } from "@/hooks/teams/use-teams";
import { useTeamMembers } from "@/hooks/teams/use-team-members";
import { Role } from "@/generated/graphql";

// Mock des modules Apollo
jest.mock("@apollo/client/react", () => ({
  useMutation: jest.fn(),
  useQuery: jest.fn(),
}));

const { useMutation, useQuery } = require("@apollo/client/react");

// ====================
// Tests pour useAdminUsers
// ====================
describe("useAdminUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait retourner la liste des utilisateurs", () => {
    const mockUsers = [
      {
        id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: Role.User,
      },
      {
        id: "2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: Role.Admin,
      },
    ];

    useQuery.mockReturnValue({
      data: { users: mockUsers },
      refetch: jest.fn(),
    });

    const result = renderHook(() => useAdminUsers()).result.current;

    expect(result).toHaveLength(2);
    expect(result[0].email).toBe("john@example.com");
  });

  it("devrait retourner un tableau vide si pas de données", () => {
    useQuery.mockReturnValue({
      data: undefined,
      refetch: jest.fn(),
    });

    const result = renderHook(() => useAdminUsers()).result.current;

    expect(result).toEqual([]);
  });

  it("devrait retourner un tableau vide si users est undefined", () => {
    useQuery.mockReturnValue({
      data: { users: undefined },
      refetch: jest.fn(),
    });

    const result = renderHook(() => useAdminUsers()).result.current;

    expect(result).toEqual([]);
  });
});

// ====================
// Tests pour useAdminCreateUser
// ====================
describe("useAdminCreateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait créer un utilisateur avec succès", async () => {
    const mockRefetch = jest.fn();
    const mockCreateMutation = jest.fn().mockResolvedValue({
      data: {
        createUser: {
          id: "3",
          firstName: "Bob",
          lastName: "Martin",
          email: "bob@example.com",
        },
      },
    });

    useQuery.mockReturnValue({
      data: { users: [] },
      refetch: mockRefetch,
    });

    useMutation.mockReturnValue([
      mockCreateMutation,
      { loading: false, error: null },
    ]);

    const { result } = renderHook(() => useAdminCreateUser());

    const userInput = {
      firstName: "Bob",
      lastName: "Martin",
      password: "secure123",
      email: "bob@example.com",
      phone: "0612345678",
      role: Role.User,
    };

    const createdUser = await result.current.adminCreateUser(userInput);

    expect(mockCreateMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          firstName: "Bob",
          lastName: "Martin",
          password: "secure123",
          email: "bob@example.com",
          phone: "0612345678",
          role: Role.User,
        },
      },
    });
    expect(createdUser).toEqual({
      id: "3",
      firstName: "Bob",
      lastName: "Martin",
      email: "bob@example.com",
    });
  });

  it("devrait refetch après création", async () => {
    const mockRefetch = jest.fn();
    const mockCreateMutation = jest.fn().mockResolvedValue({
      data: { createUser: {} },
    });

    useQuery.mockReturnValue({
      data: { users: [] },
      refetch: mockRefetch,
    });

    // Simuler l'appel de onCompleted
    useMutation.mockImplementation((doc: any, options: { onCompleted: (arg0: any) => void; }) => {
      return [
        async (...args: any[]) => {
          const result = await mockCreateMutation(...args);
          if (options?.onCompleted) {
            options.onCompleted(result.data);
          }
          return result;
        },
        { loading: false, error: null },
      ];
    });

    const { result } = renderHook(() => useAdminCreateUser());

    await result.current.adminCreateUser({
      firstName: "Test",
      lastName: "User",
      password: "pass",
      email: "test@test.com",
      phone: "123",
      role: Role.User,
    });

    expect(mockRefetch).toHaveBeenCalled();
  });

  it("devrait exposer l'état de chargement", () => {
    useQuery.mockReturnValue({
      data: { users: [] },
      refetch: jest.fn(),
    });

    useMutation.mockReturnValue([jest.fn(), { loading: true, error: null }]);

    const { result } = renderHook(() => useAdminCreateUser());

    expect(result.current.loading).toBe(true);
  });
});

// ====================
// Tests pour useAdminUpdateUser
// ====================
describe("useAdminUpdateUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait mettre à jour un utilisateur", async () => {
    const mockRefetch = jest.fn();
    const mockUpdateMutation = jest.fn().mockResolvedValue({
      data: {
        updateUser: {
          id: "1",
          firstName: "John Updated",
          lastName: "Doe",
          email: "john.updated@example.com",
        },
      },
    });

    useQuery.mockReturnValue({
      data: { users: [] },
      refetch: mockRefetch,
    });

    useMutation.mockReturnValue([
      mockUpdateMutation,
      { loading: false, error: null },
    ]);

    const { result } = renderHook(() => useAdminUpdateUser());

    const updateInput = {
      id: "1",
      firstName: "John Updated",
      lastName: "Doe",
      email: "john.updated@example.com",
      phone: "0612345678",
      role: Role.Admin,
    };

    const updatedUser = await result.current.adminUpdateUser(updateInput);

    expect(mockUpdateMutation).toHaveBeenCalledWith({
      variables: {
        id: "1",
        input: {
          firstName: "John Updated",
          lastName: "Doe",
          email: "john.updated@example.com",
          phone: "0612345678",
          role: Role.Admin,
        },
      },
    });
    expect(updatedUser?.firstName).toBe("John Updated");
  });
});

// ====================
// Tests pour useAdminUser
// ====================
describe("useAdminUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait récupérer un utilisateur par ID", () => {
    const mockUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    };

    useQuery.mockReturnValue({
      data: { getUser: mockUser },
      loading: false,
    });

    const { result } = renderHook(() => useAdminUser("1"));

    expect(result.current.data).toEqual({ getUser: mockUser });
    expect(result.current.loading).toBe(false);
  });

  it("devrait passer le bon ID dans les variables", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: true,
    });

    renderHook(() => useAdminUser("123"));

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        variables: { id: "123" },
      })
    );
  });
});

// ====================
// Tests pour useAdminDeleteUser
// ====================
describe("useAdminDeleteUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait supprimer un utilisateur", async () => {
    const mockRefetch = jest.fn();
    const mockDeleteMutation = jest.fn().mockResolvedValue({
      data: { deleteUser: true },
    });

    useQuery.mockReturnValue({
      data: { users: [] },
      refetch: mockRefetch,
    });

    useMutation.mockReturnValue([mockDeleteMutation]);

    const { result } = renderHook(() => useAdminDeleteUser());

    const deleteResult = await result.current.adminDeleteUser({ id: "1" });

    expect(mockDeleteMutation).toHaveBeenCalledWith({
      variables: { id: "1" },
    });
    expect(deleteResult).toBe(true);
  });
});

// ====================
// Tests pour useTeams
// ====================
describe("useTeams", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait récupérer la liste des équipes", () => {
    const mockTeams = [
      { id: "1", name: "Team A", description: "Description A" },
      { id: "2", name: "Team B", description: "Description B" },
    ];

    useQuery.mockReturnValue({
      data: { teams: mockTeams },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    useMutation.mockReturnValue([jest.fn(), { loading: false }]);

    const { result } = renderHook(() => useTeams());

    expect(result.current.teams).toHaveLength(2);
    expect(result.current.teams[0].name).toBe("Team A");
    expect(result.current.loading).toBe(false);
  });

  it("devrait créer une équipe", async () => {
    const mockCreateMutation = jest.fn().mockResolvedValue({
      data: {
        createTeam: {
          id: "3",
          name: "New Team",
          description: "New Description",
        },
      },
    });

    useQuery.mockReturnValue({
      data: { teams: [] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 1) {
        return [mockCreateMutation, { loading: false }];
      }
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() => useTeams());

    const createResult = await result.current.createTeam({
      name: "New Team",
      description: "New Description",
      managerID: "1"
    });

    expect(mockCreateMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          name: "New Team",
          description: "New Description",
          managerID: "1"
        },
      },
    });
    expect(createResult.success).toBe(true);
    expect(createResult.data?.name).toBe("New Team");
  });

  it("devrait mettre à jour une équipe", async () => {
    const mockUpdateMutation = jest.fn().mockResolvedValue({
      data: {
        updateTeam: {
          id: "1",
          name: "Updated Team",
          description: "Updated Description",
        },
      },
    });

    useQuery.mockReturnValue({
      data: { teams: [] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 2) {
        return [mockUpdateMutation, { loading: false }];
      }
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() => useTeams());

    const updateResult = await result.current.updateTeam("1", {
      name: "Updated Team",
      description: "Updated Description",
    });

    expect(mockUpdateMutation).toHaveBeenCalledWith({
      variables: {
        id: "1",
        input: {
          name: "Updated Team",
          description: "Updated Description",
        },
      },
    });
    expect(updateResult.success).toBe(true);
  });

  it("devrait supprimer une équipe", async () => {
    const mockDeleteMutation = jest.fn().mockResolvedValue({
      data: { deleteTeam: true },
    });

    useQuery.mockReturnValue({
      data: { teams: [] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 3) {
        return [mockDeleteMutation, { loading: false }];
      }
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() => useTeams());

    const deleteResult = await result.current.deleteTeam("1");

    expect(mockDeleteMutation).toHaveBeenCalledWith({
      variables: { id: "1" },
    });
    expect(deleteResult.success).toBe(true);
  });

  it("devrait gérer les erreurs lors de la création", async () => {
    const mockError = new Error("Creation failed");
    const mockCreateMutation = jest.fn().mockRejectedValue(mockError);

    // Mock console.error pour éviter les logs pendant les tests
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    useQuery.mockReturnValue({
      data: { teams: [] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 1) {
        return [mockCreateMutation, { loading: false }];
      }
      return [jest.fn(), { loading: false }];
    });

    const { result } = renderHook(() => useTeams());

    const createResult = await result.current.createTeam({
      name: "New Team",
      description: "Description",
      managerID: "1"
    });

    expect(createResult.success).toBe(false);
    expect(createResult.error).toBe(mockError);

    consoleErrorSpy.mockRestore();
  });

  it("devrait retourner un tableau vide si pas de teams", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    useMutation.mockReturnValue([jest.fn(), { loading: false }]);

    const { result } = renderHook(() => useTeams());

    expect(result.current.teams).toEqual([]);
  });
});

// ====================
// Tests pour useTeamMembers
// ====================
describe("useTeamMembers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait récupérer les membres d'une équipe", () => {
    const mockMembers = [
      { id: "1", firstName: "John", lastName: "Doe" },
      { id: "2", firstName: "Jane", lastName: "Smith" },
    ];

    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: mockMembers },
          loading: false,
          refetch: jest.fn(),
        };
      }
      return {
        data: { timeTableEntries: [] },
        loading: false,
      };
    });

    useMutation.mockReturnValue([jest.fn()]);

    const { result } = renderHook(() => useTeamMembers("team1"));

    expect(result.current.members).toHaveLength(2);
    expect(result.current.members[0].firstName).toBe("John");
  });

  it("ne devrait pas charger si teamId n'est pas fourni", () => {
    useQuery.mockReturnValue({
      data: null,
      loading: false,
      refetch: jest.fn(),
    });

    useMutation.mockReturnValue([jest.fn()]);

    renderHook(() => useTeamMembers(""));

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        skip: true,
      })
    );
  });

  it("devrait ajouter un membre", async () => {
    const mockAddMutation = jest.fn().mockResolvedValue({
      data: { addUserToTeam: true },
    });
    const mockRefetch = jest.fn();

    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: [] },
          loading: false,
          refetch: mockRefetch,
        };
      }
      return {
        data: { timeTableEntries: [] },
        loading: false,
      };
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 1) {
        return [mockAddMutation];
      }
      return [jest.fn()];
    });

    const { result } = renderHook(() => useTeamMembers("team1"));

    const addResult = await result.current.addMember("user1");

    expect(mockAddMutation).toHaveBeenCalledWith({
      variables: { teamID: "team1", userID: "user1" },
    });
    expect(addResult.success).toBe(true);
  });

  it("devrait ajouter plusieurs membres", async () => {
    const mockAddMutation = jest.fn().mockResolvedValue({
      data: { addUsersToTeam: true },
    });

    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: [] },
          loading: false,
          refetch: jest.fn(),
        };
      }
      return {
        data: { timeTableEntries: [] },
        loading: false,
      };
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 2) {
        return [mockAddMutation];
      }
      return [jest.fn()];
    });

    const { result } = renderHook(() => useTeamMembers("team1"));

    const addResult = await result.current.addMembers(["user1", "user2"]);

    expect(mockAddMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          teamID: "team1",
          userIDs: ["user1", "user2"],
        },
      },
    });
    expect(addResult.success).toBe(true);
  });

  it("devrait retirer un membre", async () => {
    const mockRemoveMutation = jest.fn().mockResolvedValue({
      data: { removeUserFromTeam: true },
    });

    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: [] },
          loading: false,
          refetch: jest.fn(),
        };
      }
      return {
        data: { timeTableEntries: [] },
        loading: false,
      };
    });

    let mutationIndex = 0;
    useMutation.mockImplementation(() => {
      mutationIndex++;
      if (mutationIndex === 3) {
        return [mockRemoveMutation];
      }
      return [jest.fn()];
    });

    const { result } = renderHook(() => useTeamMembers("team1"));

    const removeResult = await result.current.removeMember("user1");

    expect(mockRemoveMutation).toHaveBeenCalledWith({
      variables: { teamID: "team1", userID: "user1" },
    });
    expect(removeResult.success).toBe(true);
  });

  it("devrait détecter si un utilisateur est présent", () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const arrival = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2h avant
    const departure = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h après

    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: [] },
          loading: false,
          refetch: jest.fn(),
        };
      }
      return {
        data: {
          timeTableEntries: [
            {
              userID: { id: "user1" },
              arrival: arrival.toISOString(),
              departure: departure.toISOString(),
            },
          ],
        },
        loading: false,
      };
    });

    useMutation.mockReturnValue([jest.fn()]);

    const { result } = renderHook(() => useTeamMembers("team1"));

    expect(result.current.isUserPresent("user1")).toBe("working");
  });

  it("devrait détecter qu'un utilisateur est absent", () => {
    let queryIndex = 0;
    useQuery.mockImplementation(() => {
      queryIndex++;
      if (queryIndex === 1) {
        return {
          data: { usersByTeam: [] },
          loading: false,
          refetch: jest.fn(),
        };
      }
      return {
        data: { timeTableEntries: [] },
        loading: false,
      };
    });

    useMutation.mockReturnValue([jest.fn()]);

    const { result } = renderHook(() => useTeamMembers("team1"));

    expect(result.current.isUserPresent("user1")).toBe("absent");
  });
});