"use client";

import { graphql } from "@/generated/gql";
import {
  SignUpMutation,
  SignUpMutationVariables,
  Role,
  SignUpDocument,
  UpdateProfileDocument,
  DeleteProfileDocument,
} from "@/generated/graphql";
import { useMutation } from "@apollo/client/react";

export function useDeleteProfile() {
  const [deleteProfileMutation, { data, loading, error }] = useMutation(
    DeleteProfileDocument,
  );

  const deleteProfile = async () => {
    const result = await deleteProfileMutation();
    return result.data;
  };

  return {
    deleteProfile,
    data,
    loading,
    error,
  };
}
