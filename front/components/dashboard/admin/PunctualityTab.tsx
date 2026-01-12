import React from "react";
import { ChartCard } from "../ChartCard";
import { Timer, CheckCircle, XCircle } from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    AreaChart,
    Area,
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

interface PunctualityTabProps {
    punctuality: any;
}

export function PunctualityTab({ punctuality }: PunctualityTabProps) {
    return (
        <div className= "space-y-6" >
        {/* Punctuality Stats */ }
        < div className = "grid grid-cols-1 md:grid-cols-4 gap-4" >
            <ChartCard title="Taux à l'Heure" icon = { CheckCircle } >
                <div className="text-3xl font-bold text-green-600" >
                    {((punctuality.onTimeRate || 0) * 100).toFixed(1)
}%
    </div>
    < div className = "text-sm text-muted-foreground mt-2" >
        { punctuality.punctualUsers || 0 } utilisateurs ponctuels
            </div>
            </ChartCard>

            < ChartCard title = "Taux de Retard" icon = { XCircle } >
                <div className="text-3xl font-bold text-orange-600" >
                    {((punctuality.lateRate || 0) * 100).toFixed(1)}%
                        </div>
                        < div className = "text-sm text-muted-foreground mt-2" >
                            { punctuality.lateUsers || 0 } utilisateurs en retard
                                </div>
                                </ChartCard>

                                < ChartCard title = "Retard Moyen" icon = { Timer } >
                                    <div className="text-3xl font-bold text-red-600" >
                                        {(punctuality.avgLateMinutes || 0).toFixed(0)} min
                                            </div>
                                            < div className = "text-sm text-muted-foreground mt-2" >
                                                Par incident de retard
                                                    </div>
                                                    </ChartCard>

                                                    < ChartCard title = "Incidents" icon = { Timer } >
                                                        <div className="text-3xl font-bold" >
                                                            { punctuality.totalLateIncidents || 0 }
                                                            </div>
                                                            < div className = "text-sm text-muted-foreground mt-2" >
                                                                Total retards détectés
                                                                    </div>
                                                                    </ChartCard>
                                                                    </div>

{/* Punctuality Trend */ }
{
    punctuality.trendByWeek && punctuality.trendByWeek.length > 0 && (
        <ChartCard title="Évolution Hebdomadaire" icon = { Timer } >
            <ChartContainer
            config={
        {
            onTimeRate: { label: "Taux à l'heure", color: COLORS.success },
            avgLateMinutes: { label: "Retard moyen", color: COLORS.error },
        }
    }
    className = "h-[300px]"
        >
        <ResponsiveContainer width="100%" height = "100%" >
            <AreaChart data={ punctuality.trendByWeek }>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekStart" />
                        <YAxis />
                        < ChartTooltip content = {< ChartTooltipContent />} />
                            < Area
type = "monotone"
dataKey = "onTimeRate"
stroke = { COLORS.success }
fill = { COLORS.success }
fillOpacity = { 0.2}
name = "Taux à l'heure"
    />
    </AreaChart>
    </ResponsiveContainer>
    </ChartContainer>
    </ChartCard>
      )}
</div>
  );
}
