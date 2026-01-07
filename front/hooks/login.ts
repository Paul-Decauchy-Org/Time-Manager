"use client";

import { useMutation } from "@apollo/client/react";
import { LoginDocument, MeDocument } from "@/generated/graphql";

export function useLogin() {
  // Ensure Me query is refetched after login so AuthProvider gets updated user immediately
  const [loginMutation, { data, loading, error }] = useMutation(LoginDocument, {
    refetchQueries: [{ query: MeDocument }],
    awaitRefetchQueries: true,
  });

  const login = async (email: string, password: string) => {
    const result = await loginMutation({
      variables: { email: email, password: password },
    });
    return result.data?.login;
  };

  return {
    login,
    data,
    loading,
    error,
  };
}
