import React from "react";
import { StatCard } from "../StatCard";
import { ChartCard } from "../ChartCard";
import {
    Users,
    UsersRound,
    Clock,
    TrendingUp,
    AlertTriangle,
    Activity,
    Award,
} from "lucide-react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    purple: "#a855f7",
    pink: "#ec4899",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

interface OverviewTabProps {
    summary: any;
    workload: any;
    punctuality: any;
    overtime: any;
    compliance: any;
    productivity: any;
}

export function OverviewTab({
    summary,
    workload,
    punctuality,
    overtime,
    compliance,
    productivity,
}: OverviewTabProps) {
    return (
        <>
        {/* Summary Stats */ }
        < div className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" >
            <StatCard
          icon={ Users }
    label = "Utilisateurs Totaux"
    value = { summary.totalUsers || 0 }
    subtitle = {`${summary.activeUsers || 0} actifs`
}
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
icon = { TrendingUp }
label = "Conformité"
value = {`${((summary.complianceRate || 0) * 100).toFixed(1)}%`}
        />
    </div>

{/* Charts Grid */ }
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6" >
    {/* Workload Overview */ }
    < ChartCard title = "Charge de Travail" icon = { Clock } >
        <div className="space-y-4" >
            <div className="grid grid-cols-2 gap-4" >
                <div>
                <div className="text-sm text-muted-foreground" > Heures moy / jour </div>
                    < div className = "text-2xl font-bold" >
                        {((workload.avgDailyMinutes || 0) / 60).toFixed(1)}h
                            </div>
                            </div>
                            < div >
                            <div className="text-sm text-muted-foreground" > Pic journalier </div>
                                < div className = "text-2xl font-bold" >
                                    {((workload.peakDayMinutes || 0) / 60).toFixed(1)}h
                                        </div>
                                        </div>
                                        </div>
                                        < div >
                                        <div className="text-xs text-muted-foreground" > Jour de pic </div>
                                            < div className = "font-medium" > { workload.peakDay || "N/A" } </div>
                                                </div>
                                                </div>
                                                </ChartCard>

{/* Punctuality */ }
<ChartCard title="Ponctualité" icon = { Activity } >
    <div className="space-y-4" >
        <div className="grid grid-cols-2 gap-4" >
            <div>
            <div className="text-sm text-muted-foreground" > À l'heure</div>
                < div className = "text-2xl font-bold text-green-600" >
                    {((punctuality.onTimeRate || 0) * 100).toFixed(1)}%
                        </div>
                        </div>
                        < div >
                        <div className="text-sm text-muted-foreground" > En retard </div>
                            < div className = "text-2xl font-bold text-orange-600" >
                                {((punctuality.lateRate || 0) * 100).toFixed(1)}%
                                    </div>
                                    </div>
                                    </div>
                                    < div >
                                    <div className="text-xs text-muted-foreground" > Retard moyen </div>
                                        < div className = "font-medium" > {(punctuality.avgLateMinutes || 0).toFixed(0)} minutes </div>
                                            </div>
                                            </div>
                                            </ChartCard>

{/* Overtime Summary */ }
<ChartCard title="Résumé Heures Supplémentaires" icon = { Clock } >
    <div className="space-y-4" >
        <div className="grid grid-cols-2 gap-4" >
            <div>
            <div className="text-sm text-muted-foreground" > Total Heures Sup </div>
                < div className = "text-2xl font-bold" >
                    {((overtime.totalOvertimeMinutes || 0) / 60).toFixed(1)}h
                        </div>
                        </div>
                        < div >
                        <div className="text-sm text-muted-foreground" > Utilisateurs concernés </div>
                            < div className = "text-2xl font-bold" > { overtime.usersWithOvertime || 0 } </div>
                                </div>
                                </div>
                                </div>
                                </ChartCard>

{/* Productivity */ }
<ChartCard title="Productivité" icon = { TrendingUp } >
    <div className="space-y-4" >
        <div className="grid grid-cols-2 gap-4" >
            <div>
            <div className="text-sm text-muted-foreground" > Taux d'efficacité moyen</div>
                < div className = "text-2xl font-bold" >
                    {((productivity.avgEfficiencyRate || 0) * 100).toFixed(0)}%
                        </div>
                        </div>
                        < div >
                        <div className="text-sm text-muted-foreground" > Heures productives </div>
                            < div className = "text-2xl font-bold" > { productivity.totalProductiveHours || 0 }h </div>
                                </div>
                                </div>

{
    productivity.topPerformers && productivity.topPerformers.length > 0 && (
        <div>
        <h4 className="text-sm font-semibold mb-2" > Top Performeurs </h4>
            < div className = "space-y-2" >
                {
                    productivity.topPerformers.slice(0, 5).map((user: any, idx: number) => (
                        <div key= { idx } className = "flex items-center justify-between text-sm" >
                        <span>{ user.userName } </span>
                        < span className = "font-medium" > { user.totalHours }h({(user.efficiencyRate * 100).toFixed(0)} %)</span>
                            </div>
                  ))
}
</div>
    </div>
            )}
</div>
    </ChartCard>

{/* Compliance */ }
<ChartCard title="Conformité" icon = { AlertTriangle } >
    <div className="space-y-4" >
        <div className="grid grid-cols-2 gap-4" >
            <div>
            <div className="text-sm text-muted-foreground" > Sorties manquantes </div>
                < div className = "text-2xl font-bold text-orange-600" >
                    { compliance.missingCheckoutsCount || 0 }
                    </div>
                    </div>
                    < div >
                    <div className="text-sm text-muted-foreground" > Anomalies détectées </div>
                        < div className = "text-2xl font-bold text-red-600" >
                            { compliance.anomaliesDetected || 0 }
                            </div>
                            </div>
                            </div>

{
    compliance.anomalies && compliance.anomalies.length > 0 && (
        <div>
        <h4 className="text-sm font-semibold mb-2" > Types d'anomalies</h4>
            < div className = "space-y-2" >
            {
                compliance.anomalies.map((anomaly: any, idx: number) => {
                    const labels: Record<string, string> = {
                        missing_clockout: "Sorties manquantes",
                        excessive_hours: "Heures excessives (>12h)",
                        weekend_work: "Travail le weekend"
                    };
                    const severityColors: Record<string, string> = {
                        low: "text-yellow-600",
                        medium: "text-orange-600",
                        high: "text-red-600"
                    };
                    return (
                        <div key= { idx } className = "flex items-center justify-between text-sm p-2 bg-muted rounded" >
                            <div className="flex items-center gap-2" >
                                <span>{ labels[anomaly.type] || anomaly.type } </span>
                                < span className = {`text-xs px-2 py-0.5 rounded ${severityColors[anomaly.severity] || ''} bg-muted-foreground/10`
                }>
                { anomaly.severity }
                </span>
                </div>
                < span className = "font-medium" > { anomaly.count } </span>
                </div>
                );
            })
}
</div>
    </div>
            )}
</div>
    </ChartCard>
    </div>
    </>
  );
}
