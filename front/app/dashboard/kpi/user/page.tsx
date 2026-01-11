"use client";

import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserKpi } from "@/hooks/useUserKpi";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type Preset = "7d" | "30d" | "90d";
const PRESETS: Preset[] = ["7d", "30d", "90d"];
const PRESET_LABELS: Record<Preset, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
};

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.max(0, mins % 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

export default function UserKpiPage() {
  const { user } = useAuth();
  const [preset, setPreset] = useState<Preset>("30d");
  const { summary, loading, error, from, to } = useUserKpi({
    userID: user?.id,
    preset: preset as any,
  });

  const daily = (summary?.dailyWorked ?? []).map((p: any) => ({
    date: String(p.date),
    minutes: Number(p.minutes),
  }));

  const header = React.createElement(
    "div",
    { className: "flex items-center justify-between gap-3 p-6" },
    React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "text-2xl font-semibold" },
        "Mes KPIs",
      ),
      React.createElement(
        "div",
        { className: "text-muted-foreground text-sm" },
        `Periode: ${from} - ${to}`,
      ),
    ),
    React.createElement(
      "div",
      { className: "flex items-center gap-2" },
      PRESETS.map((p) => {
        const label = PRESET_LABELS[p];
        return React.createElement(
          "button",
          {
            key: p,
            className: `h-8 rounded-md border px-3 text-sm ${preset === p ? "bg-accent" : ""}`,
            onClick: () => setPreset(p),
          },
          label,
        );
      }),
    ),
  );

  const stats = [
    {
      label: "Temps travaille",
      value: summary ? formatMinutes(Number(summary.workedMinutes)) : "-",
    },
    {
      label: "Heures sup",
      value: summary ? formatMinutes(Number(summary.overtimeMinutes)) : "-",
    },
    {
      label: "Jours presents",
      value: summary ? String(Number(summary.daysPresent)) : "-",
    },
    {
      label: "Streak",
      value: summary ? `${Number(summary.currentStreakDays)} j` : "-",
    },
  ];

  const cards = React.createElement(
    "div",
    {
      className:
        "grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 px-6 mb-6",
    },
    stats.map((s) =>
      React.createElement(
        "div",
        { key: s.label, className: "rounded-xl border p-4 shadow-sm" },
        React.createElement(
          "div",
          { className: "text-sm text-muted-foreground" },
          s.label,
        ),
        React.createElement(
          "div",
          { className: "text-xl font-semibold" },
          s.value,
        ),
      ),
    ),
  );

  const chart = React.createElement(
    "div",
    { className: "px-6" },
    React.createElement(
      "div",
      { className: "rounded-xl border p-4 shadow-sm" },
      React.createElement(
        "div",
        { className: "text-lg font-semibold mb-2" },
        "Temps travaille par jour",
      ),
      React.createElement(
        ChartContainer as any,
        {
          config: { minutes: { label: "Minutes", color: "var(--primary)" } },
          className: "aspect-auto h-[260px] w-full",
        },
        React.createElement(
          AreaChart as any,
          { data: daily },
          React.createElement(
            "defs",
            null,
            React.createElement(
              "linearGradient",
              { id: "fillMinutes", x1: "0", y1: "0", x2: "0", y2: "1" },
              React.createElement("stop", {
                offset: "5%",
                stopColor: "var(--color-minutes)",
                stopOpacity: 0.8,
              }),
              React.createElement("stop", {
                offset: "95%",
                stopColor: "var(--color-minutes)",
                stopOpacity: 0.1,
              }),
            ),
          ),
          React.createElement(CartesianGrid as any, { vertical: false }),
          React.createElement(XAxis as any, {
            dataKey: "date",
            tickLine: false,
            axisLine: false,
            tickMargin: 8,
            minTickGap: 32,
          }),
          React.createElement(ChartTooltip as any, {
            cursor: false,
            content: React.createElement(ChartTooltipContent as any, {
              indicator: "dot",
            }),
          }),
          React.createElement(Area as any, {
            dataKey: "minutes",
            type: "natural",
            fill: "url(#fillMinutes)",
            stroke: "var(--color-minutes)",
          }),
        ),
      ),
    ),
  );

  let status: string | null = null;
  if (loading) status = "Chargement...";
  else if (error) status = `Erreur: ${error.message ?? error}`;

  return React.createElement(
    "div",
    null,
    header,
    cards,
    chart,
    status
      ? React.createElement(
        "div",
        { className: "px-6 py-3 text-destructive" },
        status,
      )
      : null,
  );
}
