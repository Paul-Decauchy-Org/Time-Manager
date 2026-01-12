import React from "react";

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    trend?: number;
}

export function StatCard({
    icon: Icon,
    label,
    value,
    subtitle,
    color = "primary",
    trend
}: StatCardProps) {
    return (
        <div className= "rounded-xl border p-4 shadow-sm bg-card" >
        <div className="flex items-center justify-between" >
            <div className="flex items-center gap-3" >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center" >
                    <Icon className="h-5 w-5 text-primary" />
                        </div>
                        < div >
                        <div className="text-sm text-muted-foreground" > { label } </div>
                            < div className = "text-2xl font-bold" > { value } </div>
    { subtitle && <div className="text-xs text-muted-foreground mt-1" > { subtitle } </div> }
    </div>
        </div>
    {
        trend !== undefined && (
            <div className={ `text-sm font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}` }>
                { trend >= 0 ? "+" : ""
    } { trend.toFixed(1) }%
        </div>
        )
}
</div>
    </div>
  );
}
