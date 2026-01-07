"use client";

import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import {
  KpiUserSummaryDocument,
  type KpiUserSummaryQuery,
} from "@/generated/graphql";

type Preset = "7d" | "30d" | "90d";

export interface UseUserKpiParams {
  userID?: string;
  from?: string;
  to?: string;
  preset?: Preset;
  fetchPolicy?:
    | "cache-first"
    | "cache-and-network"
    | "network-only"
    | "cache-only"
    | "no-cache"
    | "standby";
}

export interface UseUserKpiResult {
  summary: KpiUserSummaryQuery["kpiUserSummary"] | undefined;
  loading: boolean;
  error: any;
  refetch: () => any;
  from: string;
  to: string;
  preset: Preset;
}

function computeRange(preset: Preset): { from: string; to: string } {
  const toDate = new Date();
  const to = toDate.toISOString().slice(0, 10);
  const daysMap: Record<Preset, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[preset];
  const fromDate = new Date(
    toDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000,
  );
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export function useUserKpi(params?: UseUserKpiParams): UseUserKpiResult {
  const preset: Preset = params?.preset ?? "30d";
  const range = useMemo(() => computeRange(preset), [preset]);
  const from = params?.from ?? range.from;
  const to = params?.to ?? range.to;

  const { data, loading, error, refetch } = useQuery(KpiUserSummaryDocument, {
    variables: { userID: params?.userID, from, to },
    fetchPolicy: (params?.fetchPolicy as any) ?? "network-only",
    skip: !params?.userID,
  });

  return {
    summary: data?.kpiUserSummary,
    loading,
    error,
    refetch,
    from,
    to,
    preset,
  };
}

export default useUserKpi;
