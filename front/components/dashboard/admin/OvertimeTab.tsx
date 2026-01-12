import React from "react";
import { ChartCard } from "../ChartCard";
import { Clock, Award } from "lucide-react";
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

interface OvertimeTabProps {
    overtime: any;
}

export function OvertimeTab({ overtime }: OvertimeTabProps) {
    return (
        <div className= "space-y-6" >
        {/* Summary */ }
        < ChartCard title = "Résumé Heures Supplémentaires" icon = { Clock } >
            <div className="grid grid-cols-2 gap-4" >
                <div>
                <div className="text-sm text-muted-foreground" > Total Heures Sup </div>
                    < div className = "text-3xl font-bold" >
                        {((overtime.totalOvertimeMinutes || 0) / 60).toFixed(1)
} h
    </div>
    </div>
    < div >
    <div className="text-sm text-muted-foreground" > Utilisateurs concernés </div>
        < div className = "text-3xl font-bold" > { overtime.usersWithOvertime || 0 } </div>
            </div>
            </div>
            </ChartCard>

            < div className = "grid grid-cols-1 lg:grid-cols-2 gap-6" >
                {/* Top Overtime Users */ }
{
    overtime.topOvertimeUsers && overtime.topOvertimeUsers.length > 0 && (
        <ChartCard title="Top Heures Supplémentaires" icon = { Award } >
            <div className="space-y-2" >
            {
                overtime.topOvertimeUsers.slice(0, 10).map((user: any, idx: number) => (
                    <div
                  key= { idx }
                  className = "flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                    <div className="flex-1" >
                <div className="font-bold text-base" > { user.userName || "Utilisateur inconnu" } </div>
                < div className = "text-xs text-muted-foreground mt-1" >
                { user.daysWorked } jour{ user.daysWorked > 1 ? 's' : '' } avec heures sup
                </div>
                </div>
                < div className = "text-right ml-4" >
                <div className="font-bold text-lg text-purple-600" >
                {(user.overtimeMinutes / 60).toFixed(1)}h
                    </div>
                    < div className = "text-xs text-muted-foreground" > heures sup </div>
                        </div>
                        </div>
              ))
}
</div>
    </ChartCard>
        )}

{/* Overtime by Week */ }
{
    overtime.overtimeByWeek && overtime.overtimeByWeek.length > 0 && (
        <ChartCard title="Heures Sup par Période" icon = { Clock } >
            <ChartContainer
              config={
        {
            totalMinutes: { label: "Heures Sup", color: COLORS.purple },
        }
    }
    className = "h-[300px]"
        >
        <ResponsiveContainer width="100%" height = "100%" >
            <BarChart data={ overtime.overtimeByWeek }>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodStart" />
                        <YAxis />
                        < ChartTooltip content = {< ChartTooltipContent />} />
                            < Bar
dataKey = "totalMinutes"
fill = { COLORS.purple }
radius = { [8, 8, 0, 0]}
name = "Minutes"
    />
    </BarChart>
    </ResponsiveContainer>
    </ChartContainer>
    </ChartCard>
        )}
</div>
    </div>
  );
}
