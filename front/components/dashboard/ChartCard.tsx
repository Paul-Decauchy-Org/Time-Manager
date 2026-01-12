import React from "react";

interface ChartCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
}

export function ChartCard({ title, icon: Icon, children }: ChartCardProps) {
    return (
        <div className= "rounded-xl border p-6 shadow-sm bg-card" >
        <div className="flex items-center gap-2 mb-4" >
            <Icon className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold" > { title } </h3>
                    </div>
    { children }
    </div>
  );
}
