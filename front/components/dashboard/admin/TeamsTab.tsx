import React from "react";
import { ChartCard } from "../ChartCard";
import { Users } from "lucide-react";

interface TeamsTabProps {
    teams: any[];
}

export function TeamsTab({ teams }: TeamsTabProps) {
    if (!teams || teams.length === 0) {
        return (
            <div className= "text-center text-muted-foreground py-8" >
            Aucune équipe disponible
                </div>
    );
    }

    return (
        <div className= "space-y-6" >
        {
            teams.map((team: any, idx: number) => (
                <ChartCard key= { idx } title = { team.teamName || `Équipe ${idx + 1}` } icon = { Users } >
                <div className="space-y-4" >
                {/* Team Stats */ }
            < div className = "grid grid-cols-2 md:grid-cols-4 gap-4" >
            <div>
            <div className="text-sm text-muted-foreground" > Membres </div>
            < div className = "text-2xl font-bold" > { team.memberCount || 0 } </div>
            </div>
            < div >
            <div className="text-sm text-muted-foreground" > Actifs maintenant </div>
            < div className = "text-2xl font-bold text-green-600" > { team.activeNow || 0 } </div>
            </div>
            < div >
            <div className="text-sm text-muted-foreground" > Heures travaillées </div>
            < div className = "text-2xl font-bold" >
            {((team.totalWorkedMinutes || 0) / 60).toFixed(1)}h
                </div>
                </div>
                < div >
                <div className="text-sm text-muted-foreground" > Heures moy / membre </div>
                    < div className = "text-2xl font-bold" >
                        {((team.avgMinutesPerMember || 0) / 60).toFixed(1)
} h
    </div>
    </div>
    </div>

{/* Top Contributors */ }
{
    team.topContributors && team.topContributors.length > 0 && (
        <div>
        <h4 className="text-sm font-semibold mb-3" > Top Contributeurs </h4>
            < div className = "space-y-2" >
            {
                team.topContributors.slice(0, 5).map((member: any, memberIdx: number) => (
                    <div
                      key= { memberIdx }
                      className = "flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                    <div>
                    <div className="font-medium" > { member.userName } </div>
                < div className = "text-xs text-muted-foreground" >
                { member.daysPresent } jour(s) présent(s)
                </div>
                </div>
                < div className = "text-right" >
                <div className="font-bold" >
                {((member.workedMinutes || 0) / 60).toFixed(1)}h
                    </div>
                    < div className = "text-xs text-muted-foreground" >
                        +{((member.overtimeMinutes || 0) / 60).toFixed(1)
}h sup
    </div>
    </div>
    </div>
                  ))}
</div>
    </div>
            )}
</div>
    </ChartCard>
      ))}
</div>
  );
}
