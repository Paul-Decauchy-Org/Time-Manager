"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminKpiDashboardDocument } from "@/generated/graphql";
import { print } from "graphql";
import { Download, Users, UsersRound, Clock, CheckCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatCard } from "@/components/dashboard/StatCard";
import { OverviewTab } from "@/components/dashboard/admin/OverviewTab";
import { WorkloadTab } from "@/components/dashboard/admin/WorkloadTab";
import { PunctualityTab } from "@/components/dashboard/admin/PunctualityTab";
import { OvertimeTab } from "@/components/dashboard/admin/OvertimeTab";
import { TeamsTab } from "@/components/dashboard/admin/TeamsTab";
import { generateCSVReport, downloadCSV } from "@/lib/csv-export";

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

type Preset = "7d" | "30d" | "90d";
const PRESETS: Preset[] = ["7d", "30d", "90d"];
const PRESET_LABELS: Record<Preset, string> = {
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
};

export default function AdminKpiPage() {
  const { user } = useAuth();
  const [preset, setPreset] = useState<Preset>("30d");
  const { from, to } = rangeFromPreset(preset);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const endpoint = process.env.NEXT_PUBLIC_SCHEMA_URL as string;
        const query = print(AdminKpiDashboardDocument as any);

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query,
            variables: { from, to },
          }),
        });

        const result = await response.json();

        if (!cancelled) {
          if (result.errors) {
            setError(result.errors[0]?.message || "Erreur GraphQL");
          } else {
            setData(result.data?.adminKpiDashboard);
          }
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Erreur de chargement");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [from, to]);

  if (loading) {
    return (
      <div className= "flex items-center justify-center min-h-screen" >
      <div className="text-lg" > Chargement des KPIs...</div>
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

  if (!data) {
    return (
      <div className= "flex items-center justify-center min-h-screen" >
      <div className="text-muted-foreground" > Aucune donnée disponible </div>
        </div>
    );
  }

  const summary = data.summary || {};
  const workload = data.workload || {};
  const punctuality = data.punctuality || {};
  const overtime = data.overtime || {};
  const compliance = data.compliance || {};
  const productivity = data.productivity || {};
  const teams = data.teams || [];

  const handleExportCSV = () => {
    if (!data) return;
    const csvContent = generateCSVReport(data, from, to);
    const filename = `kpi-admin-${from}-${to}.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className= "p-6 space-y-6" >
    {/* Header */ }
    < div className = "flex items-center justify-between" >
      <div>
      <h1 className="text-3xl font-bold" > Tableau de Bord Administrateur </h1>
        < p className = "text-muted-foreground" >
          Vue d'ensemble des KPIs du {from} au {to}
            </p>
            </div>
            < div className = "flex items-center gap-2" >
              <button
            onClick={ handleExportCSV }
  className = "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
    >
    <Download className="h-4 w-4" />
      Télécharger KPI
        </button>
  {
    PRESETS.map((p) => (
      <button
              key= { p }
              onClick = {() => setPreset(p)}
  className = {`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${preset === p
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    }`
}
            >
  { PRESET_LABELS[p]}
  </button>
          ))}
</div>
  </div>

{/* Summary Cards */ }
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
  <StatCard
          icon={ Users }
label = "Utilisateurs Totaux"
value = { summary.totalUsers || 0 }
subtitle = {`${summary.activeUsers || 0} actifs maintenant`}
        />
  < StatCard
icon = { UsersRound }
label = "Équipes"
value = { summary.totalTeams || 0 }
  />
  <StatCard
          icon={ Clock }
label = "Heures Travaillées"
value = {`${summary.totalWorkedHours || 0}h`}
subtitle = {`${(summary.avgHoursPerUser || 0).toFixed(1)}h/utilisateur`}
        />
  < StatCard
icon = { CheckCircle }
label = "Taux de Conformité"
value = {`${((summary.complianceRate || 0) * 100).toFixed(1)}%`}
color = "success"
  />
  </div>

{/* Tabs for different sections */ }
<Tabs defaultValue="overview" className = "space-y-4" >
  <TabsList className="grid w-full grid-cols-5" >
    <TabsTrigger value="overview" > Vue d'ensemble</TabsTrigger>
      < TabsTrigger value = "workload" > Charge de Travail </TabsTrigger>
        < TabsTrigger value = "punctuality" > Ponctualité </TabsTrigger>
          < TabsTrigger value = "overtime" > Heures Sup </TabsTrigger>
            < TabsTrigger value = "teams" > Équipes </TabsTrigger>
              </TabsList>

{/* Overview Tab */ }
<TabsContent value="overview" className = "space-y-4" >
  <OverviewTab
            summary={ summary }
workload = { workload }
punctuality = { punctuality }
overtime = { overtime }
compliance = { compliance }
productivity = { productivity }
  />
  </TabsContent>

{/* Workload Tab */ }
<TabsContent value="workload" className = "space-y-4" >
  <WorkloadTab workload={ workload } />
    </TabsContent>

{/* Punctuality Tab */ }
<TabsContent value="punctuality" className = "space-y-4" >
  <PunctualityTab punctuality={ punctuality } />
    </TabsContent>

{/* Overtime Tab */ }
<TabsContent value="overtime" className = "space-y-4" >
  <OvertimeTab overtime={ overtime } />
    </TabsContent>

{/* Teams Tab */ }
<TabsContent value="teams" className = "space-y-4" >
  <TeamsTab teams={ teams } />
    </TabsContent>
    </Tabs>
    </div>
  );
}
