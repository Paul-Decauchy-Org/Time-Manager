"use client";

import { useMutation } from "@apollo/client/react";
import { LogoutDocument, Role } from "@/generated/graphql";

export function useLogout() {
  const [logoutMutation, { data, loading, error }] =
    useMutation(LogoutDocument);

  const logout = async () => {
    const result = await logoutMutation();
    return result.data?.logout;
  };

  return {
    logout,
    data,
    loading,
    error,
  };
}
