'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import {
  TeamsDocument,
  CreateTeamDocument,
  UpdateTeamDocument,
  DeleteTeamDocument,
  CreateTeamInput,
  UpdateTeamInput,
} from '@/generated/graphql';

export function useTeams() {
  const { data, loading, error, refetch } = useQuery(TeamsDocument, {
    fetchPolicy: 'cache-and-network',
  });

  const [createTeamMutation, { loading: creating }] = useMutation(CreateTeamDocument, {
    refetchQueries: ['Teams'],
  });

  const [updateTeamMutation, { loading: updating }] = useMutation(UpdateTeamDocument, {
    refetchQueries: ['Teams'],
  });

  const [deleteTeamMutation, { loading: deleting }] = useMutation(DeleteTeamDocument, {
    refetchQueries: ['Teams'],
  });

  const createTeam = async (input: CreateTeamInput) => {
    try {
      const result = await createTeamMutation({
        variables: { input },
      });
      return { success: true, data: result.data?.createTeam };
    } catch (err) {
      console.error('Error creating team:', err);
      return { success: false, error: err };
    }
  };

  const updateTeam = async (id: string, input: UpdateTeamInput) => {
    try {
      const result = await updateTeamMutation({
        variables: { id, input },
      });
      return { success: true, data: result.data?.updateTeam };
    } catch (err) {
      console.error('Error updating team:', err);
      return { success: false, error: err };
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      await deleteTeamMutation({
        variables: { id },
      });
      return { success: true };
    } catch (err) {
      console.error('Error deleting team:', err);
      return { success: false, error: err };
    }
  };

  return {
    teams: data?.teams || [],
    loading,
    error,
    refetch,
    createTeam,
    updateTeam,
    deleteTeam,
    creating,
    updating,
    deleting,
  };
}
