import React from "react";
import { ChartCard } from "../ChartCard";
import { BarChart3, CalendarRange } from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
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

interface WorkloadTabProps {
    workload: any;
}

export function WorkloadTab({ workload }: WorkloadTabProps) {
    return (
        <div className= "space-y-6" >

        {/* Workload Stats */ }
        < div className = "grid grid-cols-1 md:grid-cols-3 gap-4" >
            <ChartCard title="Moyenne Quotidienne" icon = { BarChart3 } >
                <div className="text-3xl font-bold" >
                    {((workload.avgDailyMinutes || 0) / 60).toFixed(2)
} h
    </div>
    < div className = "text-sm text-muted-foreground mt-2" >
        Heures moyennes par jour travaillé
            </div>
            </ChartCard>

            < ChartCard title = "Moyenne Hebdomadaire" icon = { BarChart3 } >
                <div className="text-3xl font-bold" >
                    {((workload.avgWeeklyMinutes || 0) / 60).toFixed(2)}h
                        </div>
                        < div className = "text-sm text-muted-foreground mt-2" >
                            Heures moyennes par semaine
                                </div>
                                </ChartCard>

                                < ChartCard title = "Pic Journalier" icon = { BarChart3 } >
                                    <div className="text-3xl font-bold text-orange-600" >
                                        {((workload.peakDayMinutes || 0) / 60).toFixed(2)}h
                                            </div>
                                            < div className = "text-sm text-muted-foreground mt-2" >
                                                Le { workload.peakDay || "N/A" }
</div>
    </ChartCard>
    </div>
    </div>
  );
}
