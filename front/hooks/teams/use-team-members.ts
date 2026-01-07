"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import {
  UsersByTeamDocument,
  AddUserToTeamDocument,
  AddUsersToTeamDocument,
  RemoveUserFromTeamDocument,
  TimeTableEntriesDocument,
  AddUsersToTeamInput,
} from "@/generated/graphql";

export function useTeamMembers(teamId: string) {
  // Charger les membres de l'équipe spécifique
  const {
    data: teamMembersData,
    loading: loadingMembers,
    refetch: refetchMembers,
  } = useQuery(UsersByTeamDocument, {
    variables: { teamID: teamId },
    skip: !teamId, // Ne charge pas si pas de teamId
    fetchPolicy: "cache-and-network",
  });

  const { data: timeEntriesData, loading: loadingTimeEntries } = useQuery(
    TimeTableEntriesDocument,
    {
      fetchPolicy: "cache-and-network",
    },
  );

  const [addUserMutation] = useMutation(AddUserToTeamDocument, {
    onCompleted: () => {
      refetchMembers();
    },
  });

  const [addUsersMutation] = useMutation(AddUsersToTeamDocument, {
    onCompleted: () => {
      refetchMembers();
    },
  });

  const [removeMemberMutation] = useMutation(RemoveUserFromTeamDocument, {
    onCompleted: () => {
      refetchMembers();
    },
  });

  const addMember = async (userID: string) => {
    try {
      await addUserMutation({
        variables: { teamID: teamId, userID },
      });
      return { success: true };
    } catch (err) {
      console.error("Error adding member:", err);
      return { success: false, error: err };
    }
  };

  const addMembers = async (userIds: string[]) => {
    try {
      await addUsersMutation({
        variables: {
          input: {
            teamID: teamId,
            userIDs: userIds,
          },
        },
      });
      return { success: true };
    } catch (err) {
      console.error("Error adding members:", err);
      return { success: false, error: err };
    }
  };

  const removeMember = async (userID: string) => {
    try {
      await removeMemberMutation({
        variables: { teamID: teamId, userID },
      });
      return { success: true };
    } catch (err) {
      console.error("Error removing member:", err);
      return { success: false, error: err };
    }
  };

  // Check if user is present today based on timeTables
  const isUserPresent = (userId: string): "present" | "absent" | "working" => {
    if (!timeEntriesData?.timeTableEntries) return "absent";

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Filtrer les entrées de l'utilisateur pour aujourd'hui
    const userEntries = timeEntriesData.timeTableEntries.filter((entry) => {
      if (entry.userID.id !== userId) return false;

      const entryDate = new Date(entry.arrival).toISOString().split("T")[0];
      return entryDate === today;
    });

    if (!userEntries || userEntries.length === 0) {
      return "absent";
    }

    // Vérifier si l'utilisateur est actuellement en train de travailler
    const activeEntry = userEntries.find((entry) => {
      const startTime = new Date(entry.arrival);
      const endTime = new Date(entry.departure);
      return startTime <= now && endTime >= now;
    });

    if (activeEntry) {
      return "working";
    }

    // Vérifier si l'utilisateur a déjà pointé aujourd'hui
    const hasWorkedToday = userEntries.some((entry) => {
      const endTime = new Date(entry.departure);
      return endTime < now;
    });

    return hasWorkedToday ? "present" : "absent";
  };

  const members = teamMembersData?.usersByTeam || [];

  return {
    members,
    loading: loadingMembers || loadingTimeEntries,
    isUserPresent,
    addMember,
    addMembers,
    removeMember,
    refetchMembers,
  };
}
