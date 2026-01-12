"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Heatmap } from "@/components/heatmap";
import { Users, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import {
  KpiTeamSummaryDocument,
  AllUsersDocument,
  TeamsDocument,
} from "@/generated/graphql";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import KPICSV from "@/components/kpiCSV";

function getEntriesForTeam(
  users: any[],
  teamID: string,
  from: string,
  to: string,
) {
  const members = users.filter((u) =>
    (u.teams || []).some((tm: any) => tm.id === teamID),
  );
  const fromD = new Date(from);
  const toD = new Date(to);
  const out: any[] = [];
  for (const u of members) {
    const list = u.timeTableEntries || [];
    for (const e of list) {
      const withUser = { ...e, user: u };
      let day: Date | null = null;
      if (e.day) day = new Date(e.day);
      else if (e.arrival) day = new Date(e.arrival);
      else if (e.departure) day = new Date(e.departure);
      if (!day) continue;
      if (day >= fromD && day <= toD) out.push(withUser);
    }
  }
  return out;
}

// Helpers to reduce complexity of computeTeamDerived
function isLate(arrival: Date, thresholdHour: number) {
  return (
    arrival.getHours() > thresholdHour ||
    (arrival.getHours() === thresholdHour && arrival.getMinutes() > 0)
  );
}

function addDaily(
  total: Record<string, number>,
  day: Date,
  arrival: Date | null,
  departure: Date | null,
) {
  if (!arrival || !departure) return;
  const mins = Math.max(
    0,
    Math.round((departure.getTime() - arrival.getTime()) / 60000),
  );
  const key = day.toISOString().slice(0, 10);
  total[key] = (total[key] || 0) + mins;
}

function buildDailyArray(dailyTotals: Record<string, number>) {
  return Object.entries(dailyTotals)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, minutes]) => ({ date, minutes }));
}

function pushHeat(heat: number[][], day: Date, hour: number) {
  heat[day.getDay()][hour] += 1;
}

function aggregateEntries(entries: any[], thresholdHour: number) {
  const lateByUser: Record<string, number> = {};
  const dailyTotals: Record<string, number> = {};
  const heat: number[][] = Array.from({ length: 7 }, () =>
    new Array(24).fill(0),
  );
  let lateCount = 0;
  let totalEntries = 0;
  for (const e of entries) {
    const arrival = e.arrival ? new Date(e.arrival) : null;
    const departure = e.departure ? new Date(e.departure) : null;
    const day = e.day ? new Date(e.day) : arrival || departure;
    if (!day) continue;
    addDaily(dailyTotals, day, arrival, departure);
    if (!arrival) continue;
    totalEntries++;
    if (!isLate(arrival, thresholdHour)) continue;
    lateCount++;
    const k = e.user?.id || "unknown";
    lateByUser[k] = (lateByUser[k] || 0) + 1;
    pushHeat(heat, day, arrival.getHours());
  }
  return { lateByUser, dailyTotals, heat, lateCount, totalEntries };
}

function computeTeamDerived(entries: any[]) {
  const thresholdHour = 10;
  const { lateByUser, dailyTotals, heat, lateCount, totalEntries } =
    aggregateEntries(entries, thresholdHour);
  const heatCells: { r: number; c: number; v: number }[] = [];
  for (let r = 0; r < heat.length; r++)
    for (let c = 0; c < heat[r].length; c++)
      heatCells.push({ r, c, v: heat[r][c] });
  const latenessRate = totalEntries ? lateCount / totalEntries : 0;
  const dailyArr = buildDailyArray(dailyTotals);
  const topLateName = Object.keys(lateByUser).length
    ? (() => {
      const topId = Object.entries(lateByUser).sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      const sample = entries.find((x: any) => x.user?.id === topId)?.user;
      return sample ? `${sample.firstName} ${sample.lastName}` : "-";
    })()
    : "-";
  return { latenessRate, topLateName, dailyArr, heatCells };
}

function rangeFromPreset(preset: string): { from: string; to: string } {
  const toDate = new Date();
  const to = toDate.toISOString().slice(0, 10);
  const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const days = daysMap[preset] ?? 30;
  const fromDate = new Date();
  fromDate.setDate(toDate.getDate() - days);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.max(0, mins % 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
}

type Preset = "7d" | "30d" | "90d";
const PRESETS: Preset[] = ["7d", "30d", "90d"];
const PRESET_LABELS: Record<Preset, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
};

export default function TeamKpiPage() {
  const csv = KPICSV()
  const { user, isManager } = useAuth();
  const clientRef = useRef<any>(null);
  if (!clientRef.current) {
    clientRef.current = new ApolloClient({
      link: new HttpLink({
        uri: process.env.NEXT_PUBLIC_SCHEMA_URL as string,
        credentials: "include",
        fetchOptions: {
          cache: "no-store",
          mode: "cors",
          credentials: "include",
        },
      }),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: "no-cache" },
        watchQuery: { fetchPolicy: "no-cache" },
      },
    });
  }
  const [preset, setPreset] = useState<Preset>("30d");
  const { from, to } = rangeFromPreset(preset);

  // Local UI state
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [teamID, setTeamID] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await clientRef.current.query({
          query: TeamsDocument as any,
          fetchPolicy: "no-cache",
        });
        const fetched: any[] = res?.data?.teams ?? [];
        if (!cancelled) {
          setTeams(fetched);
          if (!teamID && fetched.length) {
            const initial =
              fetched.find((x) => !isManager || x.managerID?.id === user?.id) ||
              fetched[0];
            if (initial) {
              setTeamID(initial.id);
            }
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [isManager, user?.id, teamID]);

  const [summary, setSummary] = useState<any>(null);
  const [teamEntries, setTeamEntries] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!teamID) return;
      setLoading(true);
      try {
        const kpiRes = await clientRef.current.query({
          query: KpiTeamSummaryDocument as any,
          variables: { teamID, from, to },
          fetchPolicy: "no-cache",
        });
        if (!cancelled) setSummary(kpiRes?.data?.kpiTeamSummary);
        const usersRes = await clientRef.current.query({
          query: AllUsersDocument as any,
          fetchPolicy: "no-cache",
        });
        const users: any[] = usersRes?.data?.UsersWithAllData ?? [];
        const entries = getEntriesForTeam(users, teamID, from, to);
        if (!cancelled) setTeamEntries(entries);
      } catch (e: any) {
        if (!cancelled) setError(String(e.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [teamID, from, to]);

  const cov = (summary?.coverage ?? []).map((c: any) => ({
    time: String(c.time),
    count: Number(c.count),
  }));

  const { latenessRate, topLateName, dailyArr, heatCells } =
    computeTeamDerived(teamEntries);

  const teamsToShow = teams.filter(
    (t) => !isManager || t.managerID?.id === user?.id,
  );
  const selectedTeamId: string | undefined =
    useMemo(() => {
      return teamID ?? teamsToShow[0]?.id;
    }, [teamID, teamsToShow]) || undefined;
  const teamName = useMemo(() => {
    const t = teams.find((x) => x.id === selectedTeamId);
    return t?.name || "";
  }, [teams, selectedTeamId]);

  if (loading) {
    return (
      <div className= "flex items-center justify-center min-h-screen" >
      <div className="text-lg" > Chargement des KPIs de l'équipe...</div>
        </div>
    );
  }

  if (error) {
    return (
      <div className= "flex items-center justify-center min-h-screen" >
      <div className="text-destructive" > Erreur: { error } </div>
        </div>
    );
  }

  return (
    <div className= "p-6 space-y-6" >
    {/* Header */ }
    < div className = "flex items-center justify-between" >
      <div>
      <h1 className="text-3xl font-bold" > KPIs Équipe - Manager </h1>
        < p className = "text-muted-foreground" > Équipe: { teamName || "-" } </p>
          < p className = "text-muted-foreground text-sm" >
            Période: { from } au { to }
  </p>
    </div>
    < div className = "flex items-center gap-2" >
      { csv }
      < Select
  value = { selectedTeamId }
  onValueChange = {(id: string) => {
    if (id === "no-teams") return;
    setTeamID(id);
  }
}
          >
  <SelectTrigger
              className="w-[280px]"
disabled = { teamsToShow.length === 0 }
  >
  <SelectValue
                placeholder={
  teamsToShow.length === 0
    ? "Aucune équipe"
    : "Sélectionner une équipe"
}
              />
  </SelectTrigger>
  <SelectContent>
{
  teamsToShow.length === 0 ? (
    <SelectItem value= "no-teams" disabled >
      Aucune équipe
        </SelectItem>
              ) : (
    teamsToShow.map((t) => (
      <SelectItem key= { t.id } value = { t.id } >
      { t.name }
      </SelectItem>
    ))
              )
}
</SelectContent>
  </Select>
{
  PRESETS.map((p) => (
    <button
              key= { p }
              onClick = {() => setPreset(p)}
className = {`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preset === p
    ? "bg-primary text-primary-foreground"
    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  }`}
            >
  { PRESET_LABELS[p]}
  </button>
          ))}
</div>
  </div>

{/* Summary Cards */ }
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
  <div className="rounded-xl border p-4 shadow-sm bg-card" >
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" >
      <Clock className="h-4 w-4" />
        Total Heures Travaillées
          </div>
          < div className = "text-2xl font-bold" >
            { summary? formatMinutes(Number(summary.totalWorkedMinutes)) : "-"}
</div>
  < p className = "text-xs text-muted-foreground mt-1" >
    Toutes les heures badgées de l'équipe
      </p>
      </div>

      < div className = "rounded-xl border p-4 shadow-sm bg-card" >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" >
          <TrendingUp className="h-4 w-4" />
            Moyenne par Utilisateur
              </div>
              < div className = "text-2xl font-bold" >
              {
                summary
                ? formatMinutes(
                  Math.round(Number(summary.avgWorkedMinutesPerUser || 0))
                )
              : "-"}
                </div>
                < p className = "text-xs text-muted-foreground mt-1" >
                  Charge de travail moyenne par membre
                    </p>
                    </div>

                    < div className = "rounded-xl border p-4 shadow-sm bg-card" >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" >
                        <Users className="h-4 w-4" />
                          Utilisateurs Actifs
                            </div>
                            < div className = "text-2xl font-bold" >
                              { summary? String(Number(summary.activeUsers)) : "-"}
</div>
  < p className = "text-xs text-muted-foreground mt-1" >
    Membres ayant badgé sur la période
      </p>
      </div>

      < div className = "rounded-xl border p-4 shadow-sm bg-card" >
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" >
          <AlertTriangle className="h-4 w-4" />
            Taux de Retard
              </div>
              < div className = "text-2xl font-bold" >
                { Math.round(latenessRate * 100) } %
                </div>
                < p className = "text-xs text-muted-foreground mt-1" >
                  Arrivées après 10h00(seuil de ponctualité)
                    </p>
                    </div>
                    </div>

{/* Top Late User */ }
<div className="rounded-xl border p-4 shadow-sm bg-card" >
  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1" >
    <AlertTriangle className="h-4 w-4 text-rose-500" />
      Membre avec le Plus de Retards
        </div>
        < div className = "text-xl font-semibold" > { topLateName } </div>
          < p className = "text-xs text-muted-foreground mt-1" >
            Personne ayant badgé en retard(après 10h) le plus souvent
              </p>
              </div>

{/* Coverage Chart */ }
<div className="rounded-xl border p-4 shadow-sm bg-card" >
  <div className="mb-4" >
    <h3 className="text-lg font-semibold" > Couverture Horaire de l'Équipe</h3>
      < p className = "text-sm text-muted-foreground" >
        Nombre de membres présents par tranche horaire(moyenné sur la période)
          </p>
          </div>
          < ChartContainer
config = {{ count: { label: "Présence", color: "var(--primary)" } }}
className = "aspect-auto h-[300px] w-full"
  >
  <AreaChart data={ cov }>
    <defs>
    <linearGradient id="fillCount" x1 = "0" y1 = "0" x2 = "0" y2 = "1" >
      <stop
                  offset="5%"
stopColor = "var(--color-count)"
stopOpacity = { 0.8}
  />
  <stop
                  offset="95%"
stopColor = "var(--color-count)"
stopOpacity = { 0.1}
  />
  </linearGradient>
  </defs>
  < CartesianGrid vertical = { false} />
    <XAxis
              dataKey="time"
tickLine = { false}
axisLine = { false}
tickMargin = { 8}
minTickGap = { 16}
  />
  <ChartTooltip
              cursor={ false }
content = {< ChartTooltipContent indicator = "dot" />}
            />
  < Area
dataKey = "count"
type = "natural"
fill = "url(#fillCount)"
stroke = "var(--color-count)"
  />
  </AreaChart>
  </ChartContainer>
  </div>

{/* Daily Minutes Chart */ }
<div className="rounded-xl border p-4 shadow-sm bg-card" >
  <div className="mb-4" >
    <h3 className="text-lg font-semibold" > Charge de Travail Quotidienne </h3>
      < p className = "text-sm text-muted-foreground" >
        Total des heures travaillées par jour(tous les membres cumulés)
          </p>
          </div>
          < ChartContainer
config = {{
  minutes: {
    label: "Minutes",
      color: "hsl(var(--chart-2))",
            },
}}
className = "aspect-auto h-[300px] w-full"
  >
  <BarChart data={ dailyArr }>
    <CartesianGrid vertical={ false } />
      < XAxis
dataKey = "date"
tickLine = { true}
axisLine = { true}
tickMargin = { 8}
minTickGap = { 8}
  />
  <YAxis />
  < ChartTooltip
cursor = {{ fill: "hsl(var(--muted))" }}
content = {< ChartTooltipContent indicator = "dot" />}
            />
  < Bar
dataKey = "minutes"
fill = "var(--color-minutes)"
radius = { [6, 6, 0, 0]}
  />
  </BarChart>
  </ChartContainer>
  </div>

{/* Heatmap */ }
<div className="rounded-xl border p-4 shadow-sm bg-card" >
  <div className="mb-4" >
    <h3 className="text-lg font-semibold" > Analyse des Retards </h3>
      < p className = "text-sm text-muted-foreground" >
        Visualisation des retards par jour de la semaine et heure d'arrivée
          </p>
          </div>
          < Heatmap
rows = { 7}
cols = { 24}
data = { heatCells }
max = { Math.max(1, Math.max(...heatCells.map((c) => c.v))) }
rowLabels = { ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]}
title = ""
  />
  </div>
  </div>
  );

}