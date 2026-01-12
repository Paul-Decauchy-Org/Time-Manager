export function generateCSVReport(data: any, from: string, to: string): string {
    const lines: string[] = [];
    const timestamp = new Date().toLocaleString('fr-FR');

    const summary = data.summary || {};
    const workload = data.workload || {};
    const punctuality = data.punctuality || {};
    const overtime = data.overtime || {};
    const compliance = data.compliance || {};
    const productivity = data.productivity || {};
    const teams = data.teams || [];

    // Header avec métadonnées
    lines.push('='.repeat(80));
    lines.push(`RAPPORT KPI ADMINISTRATEUR - TIME MANAGER`);
    lines.push(`Période: ${from} au ${to}`);
    lines.push(`Généré le: ${timestamp}`);
    lines.push('='.repeat(80));
    lines.push('');

    // Summary Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                            RÉSUMÉ GLOBAL                                      ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Utilisateurs Totaux,${summary.totalUsers || 0},Total d\'utilisateurs dans le système`);
    lines.push(`Utilisateurs Actifs,${summary.activeUsers || 0},Utilisateurs ayant travaillé sur la période`);
    lines.push(`Taux d'Activité,${summary.totalUsers ? ((summary.activeUsers / summary.totalUsers) * 100).toFixed(1) : 0}%,Pourcentage d\'utilisateurs actifs`);
    lines.push(`Équipes,${summary.totalTeams || 0},Nombre total d\'équipes`);
    lines.push(`Heures Travaillées,${summary.totalWorkedHours || 0}h,Cumul des heures sur la période`);
    lines.push(`Heures Moy/Utilisateur,${(summary.avgHoursPerUser || 0).toFixed(2)}h,Moyenne par utilisateur actif`);
    lines.push(`Taux de Conformité,${((summary.complianceRate || 0) * 100).toFixed(1)}%,Pourcentage d\'entrées complètes`);
    lines.push('');

    // Workload Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                          CHARGE DE TRAVAIL                                    ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Heures Moy/Jour,${((workload.avgDailyMinutes || 0) / 60).toFixed(2)}h,Moyenne quotidienne sur la période`);
    lines.push(`Heures Moy/Semaine,${((workload.avgWeeklyMinutes || 0) / 60).toFixed(2)}h,Moyenne hebdomadaire estimée`);
    lines.push(`Pic Journalier,${((workload.peakDayMinutes || 0) / 60).toFixed(2)}h,Maximum atteint le ${workload.peakDay || 'N/A'}`);
    lines.push(`Total Heures Sup,${((workload.totalOvertime || 0) / 60).toFixed(2)}h,Cumul des heures supplémentaires`);
    lines.push(`Utilisateurs avec Heures Sup,${workload.usersWithOvertime || 0},Nombre d\'utilisateurs en heures sup`);
    const avgOvertimePerDay = workload.avgDailyMinutes ? ((workload.totalOvertime / 60) / ((workload.avgWeeklyMinutes / workload.avgDailyMinutes) || 1)).toFixed(2) : '0.00';
    lines.push(`Heures Sup Moy/Jour,${avgOvertimePerDay}h,Moyenne quotidienne des heures sup`);
    lines.push('');

    // Distribution by Day
    if (workload.distributionByDay && workload.distributionByDay.length > 0) {
        lines.push('--- Distribution par Jour de la Semaine ---');
        lines.push('Jour,Heures Moyennes,Heures Totales,Minutes Totales,% du Total');
        const totalMinutes = workload.distributionByDay.reduce((sum: number, d: any) => sum + (d.totalMinutes || 0), 0);
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sortedDays = [...workload.distributionByDay].sort((a, b) =>
            dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
        );
        sortedDays.forEach((d: any) => {
            const percentage = totalMinutes > 0 ? ((d.totalMinutes / totalMinutes) * 100).toFixed(1) : '0.0';
            lines.push(`${d.day},${(d.avgMinutes / 60).toFixed(2)}h,${(d.totalMinutes / 60).toFixed(2)}h,${d.totalMinutes},${percentage}%`);
        });
        lines.push('');
    }

    // Punctuality Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                            PONCTUALITÉ                                        ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Taux à l'Heure,${((punctuality.onTimeRate || 0) * 100).toFixed(1)}%,Pourcentage d\'arrivées à l\'heure`);
    lines.push(`Taux de Retard,${((punctuality.lateRate || 0) * 100).toFixed(1)}%,Pourcentage d\'arrivées en retard`);
    lines.push(`Retard Moyen,${(punctuality.avgLateMinutes || 0).toFixed(0)} min,Durée moyenne des retards`);
    lines.push(`Total Incidents,${punctuality.totalLateIncidents || 0},Nombre total de retards détectés`);
    lines.push(`Utilisateurs Ponctuels,${punctuality.punctualUsers || 0},Jamais en retard sur la période`);
    lines.push(`Utilisateurs en Retard,${punctuality.lateUsers || 0},Au moins un retard sur la période`);
    const avgIncidentsPerUser = punctuality.lateUsers ? (punctuality.totalLateIncidents / punctuality.lateUsers).toFixed(1) : '0.0';
    lines.push(`Retards Moy/Utilisateur,${avgIncidentsPerUser},Moyenne pour les utilisateurs en retard`);
    lines.push('');

    // Tendances ponctualité
    if (punctuality.trendByWeek && punctuality.trendByWeek.length > 0) {
        lines.push('--- Tendance Hebdomadaire de Ponctualité ---');
        lines.push('Semaine,Taux à l\'Heure,Retard Moyen (min),Évolution');
        punctuality.trendByWeek.forEach((week: any, idx: number) => {
            const evolution = idx > 0 ?
                (week.onTimeRate - punctuality.trendByWeek[idx - 1].onTimeRate) >= 0 ? '↑ Amélioration' : '↓ Dégradation'
                : 'Baseline';
            lines.push(`${week.weekStart},${(week.onTimeRate * 100).toFixed(1)}%,${week.avgLateMinutes.toFixed(0)},${evolution}`);
        });
        lines.push('');
    }

    // Overtime Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                       HEURES SUPPLÉMENTAIRES                                  ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Heures Sup Totales,${((overtime.totalOvertimeMinutes || 0) / 60).toFixed(2)}h,Cumul de toutes les heures sup`);
    lines.push(`Heures Sup Moy/Utilisateur,${((overtime.avgOvertimePerUser || 0) / 60).toFixed(2)}h,Moyenne sur tous les utilisateurs`);
    lines.push(`Utilisateurs Concernés,${overtime.usersWithOvertime || 0},Nombre avec au moins 1h sup`);
    const overtimeRate = summary.activeUsers ? ((overtime.usersWithOvertime / summary.activeUsers) * 100).toFixed(1) : '0.0';
    lines.push(`Taux d'Heures Sup,${overtimeRate}%,% d\'utilisateurs en heures sup`);
    const avgOvertimePerConcerned = overtime.usersWithOvertime ? ((overtime.totalOvertimeMinutes / 60) / overtime.usersWithOvertime).toFixed(2) : '0.00';
    lines.push(`Heures Sup Moy/Concerné,${avgOvertimePerConcerned}h,Moyenne pour utilisateurs concernés`);
    lines.push('');

    // Top Overtime Users
    if (overtime.topOvertimeUsers && overtime.topOvertimeUsers.length > 0) {
        lines.push('--- Top 10 Heures Supplémentaires ---');
        lines.push('Rang,Utilisateur,Heures Sup,Jours Travaillés,Heures Sup/Jour,% du Total');
        const totalOvertimeHours = (overtime.totalOvertimeMinutes || 0) / 60;
        overtime.topOvertimeUsers.slice(0, 10).forEach((user: any, idx: number) => {
            const overtimeHours = user.overtimeMinutes / 60;
            const overtimePerDay = user.daysWorked > 0 ? (overtimeHours / user.daysWorked).toFixed(2) : '0.00';
            const percentage = totalOvertimeHours > 0 ? ((overtimeHours / totalOvertimeHours) * 100).toFixed(1) : '0.0';
            lines.push(`${idx + 1},"${user.userName}",${overtimeHours.toFixed(2)}h,${user.daysWorked},${overtimePerDay}h,${percentage}%`);
        });
        lines.push('');
    }

    // Overtime by week
    if (overtime.overtimeByWeek && overtime.overtimeByWeek.length > 0) {
        lines.push('--- Heures Supplémentaires par Semaine ---');
        lines.push('Semaine,Heures Sup Totales,Utilisateurs,Heures Moy/Utilisateur,Tendance');
        overtime.overtimeByWeek.forEach((week: any, idx: number) => {
            const avgPerUser = week.usersCount > 0 ? ((week.totalMinutes / 60) / week.usersCount).toFixed(2) : '0.00';
            const trend = idx > 0 ?
                (week.totalMinutes - overtime.overtimeByWeek[idx - 1].totalMinutes) >= 0 ? '↑' : '↓'
                : '—';
            lines.push(`${week.periodStart},${(week.totalMinutes / 60).toFixed(2)}h,${week.usersCount},${avgPerUser}h,${trend}`);
        });
        lines.push('');
    }

    // Compliance Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                            CONFORMITÉ                                         ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Entrées Manquantes,${compliance.missingEntriesCount || 0},Entrées absentes`);
    lines.push(`Entrées Incomplètes,${compliance.incompleteEntriesCount || 0},Sorties non enregistrées`);
    lines.push(`Anomalies Détectées,${compliance.anomaliesCount || 0},Total d\'irrégularités`);
    lines.push(`Taux de Conformité,${((compliance.complianceRate || 0) * 100).toFixed(1)}%,Pourcentage d\'entrées valides`);
    lines.push(`Utilisateurs avec Problèmes,${compliance.usersWithIssues || 0},Nécessitent une attention`);
    const problemRate = summary.activeUsers ? ((compliance.usersWithIssues / summary.activeUsers) * 100).toFixed(1) : '0.0';
    lines.push(`Taux de Problèmes,${problemRate}%,% d\'utilisateurs avec anomalies`);
    lines.push('');

    // Anomalies détaillées
    if (compliance.anomalies && compliance.anomalies.length > 0) {
        lines.push('--- Détail des Anomalies par Type ---');
        lines.push('Type,Description,Nombre,Sévérité,Utilisateurs Affectés,% du Total');
        const totalAnomalies = compliance.anomalies.reduce((sum: number, a: any) => sum + (a.count || 0), 0);
        const anomalyLabels: Record<string, string> = {
            missing_clockout: 'Sorties manquantes',
            excessive_hours: 'Heures excessives (>12h)',
            weekend_work: 'Travail le weekend'
        };
        compliance.anomalies.forEach((anomaly: any) => {
            const percentage = totalAnomalies > 0 ? ((anomaly.count / totalAnomalies) * 100).toFixed(1) : '0.0';
            const label = anomalyLabels[anomaly.type] || anomaly.type;
            lines.push(`${anomaly.type},"${label}",${anomaly.count},${anomaly.severity},${anomaly.affectedUsers},${percentage}%`);
        });
        lines.push('');
    }

    // Productivity Section
    lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
    lines.push('║                           PRODUCTIVITÉ                                        ║');
    lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
    lines.push('');
    lines.push('Métrique,Valeur,Détails');
    lines.push(`Taux d'Efficacité Moyen,${((productivity.avgEfficiencyRate || 0) * 100).toFixed(1)}%,Performance moyenne globale`);
    lines.push(`Heures Productives Totales,${productivity.totalProductiveHours || 0}h,Cumul des heures effectives`);
    lines.push(`Heures Moy/Utilisateur,${(productivity.avgHoursPerUser || 0).toFixed(2)}h,Moyenne par utilisateur actif`);
    const productivityScore = (productivity.avgEfficiencyRate || 0) * (productivity.avgHoursPerUser || 0);
    lines.push(`Score de Productivité,${productivityScore.toFixed(2)},Efficacité × Heures moyennes`);
    lines.push('');

    // Top Performers
    if (productivity.topPerformers && productivity.topPerformers.length > 0) {
        lines.push('--- Top Performeurs (Classement par Efficacité) ---');
        lines.push('Rang,Utilisateur,Heures Travaillées,Taux d\'Efficacité,Score,Catégorie');
        productivity.topPerformers.slice(0, 10).forEach((user: any, idx: number) => {
            const score = (user.efficiencyRate * user.totalHours).toFixed(2);
            const category = user.efficiencyRate >= 3 ? 'Excellent' :
                user.efficiencyRate >= 2 ? 'Très Bon' :
                    user.efficiencyRate >= 1 ? 'Bon' : 'À Améliorer';
            lines.push(`${idx + 1},"${user.userName}",${user.totalHours}h,${(user.efficiencyRate * 100).toFixed(1)}%,${score},${category}`);
        });
        lines.push('');
    }

    // Productivity trend
    if (productivity.productivityTrend && productivity.productivityTrend.length > 0) {
        lines.push('--- Tendance de Productivité ---');
        lines.push('Date,Efficacité Moyenne,Évolution');
        productivity.productivityTrend.forEach((trend: any, idx: number) => {
            const evolution = idx > 0 ?
                (trend.avgEfficiency - productivity.productivityTrend[idx - 1].avgEfficiency) >= 0 ? '↑' : '↓'
                : '—';
            lines.push(`${trend.date},${(trend.avgEfficiency * 100).toFixed(1)}%,${evolution}`);
        });
        lines.push('');
    }

    // Teams Section
    if (teams.length > 0) {
        lines.push('╔═══════════════════════════════════════════════════════════════════════════════╗');
        lines.push('║                          ANALYSE PAR ÉQUIPE                                   ║');
        lines.push('╚═══════════════════════════════════════════════════════════════════════════════╝');
        lines.push('');

        // Vue d'ensemble des équipes
        lines.push('--- Vue d\'Ensemble des Équipes ---');
        lines.push('Équipe,Membres,Actifs,Heures Totales,Heures Moy/Membre,Taux d\'Activité');
        teams.forEach((team: any) => {
            const activityRate = team.memberCount > 0 ? ((team.activeNow / team.memberCount) * 100).toFixed(1) : '0.0';
            lines.push(`"${team.teamName || 'Sans nom'}",${team.memberCount || 0},${team.activeNow || 0},${((team.totalWorkedMinutes || 0) / 60).toFixed(2)}h,${((team.avgMinutesPerMember || 0) / 60).toFixed(2)}h,${activityRate}%`);
        });
        lines.push('');

        // Détail par équipe
        teams.forEach((team: any, teamIdx: number) => {
            lines.push('');
            lines.push(`--- Équipe #${teamIdx + 1}: ${team.teamName || 'Sans nom'} ---`);
            lines.push('Métrique,Valeur');
            lines.push(`Membres Totaux,${team.memberCount || 0}`);
            lines.push(`Membres Actifs Actuellement,${team.activeNow || 0}`);
            lines.push(`Heures Travaillées Total,${((team.totalWorkedMinutes || 0) / 60).toFixed(2)}h`);
            lines.push(`Heures Moy par Membre,${((team.avgMinutesPerMember || 0) / 60).toFixed(2)}h`);
            const teamOvertimeTotal = team.topContributors?.reduce((sum: number, m: any) => sum + (m.overtimeMinutes || 0), 0) || 0;
            lines.push(`Heures Sup Total Équipe,${(teamOvertimeTotal / 60).toFixed(2)}h`);
            lines.push('');

            if (team.topContributors && team.topContributors.length > 0) {
                lines.push('Top Contributeurs de l\'Équipe');
                lines.push('Rang,Utilisateur,Heures,Jours Présents,Heures Sup,% Contribution Équipe');
                const teamTotalMinutes = team.totalWorkedMinutes || 1;
                team.topContributors.forEach((member: any, idx: number) => {
                    const contribution = ((member.workedMinutes / teamTotalMinutes) * 100).toFixed(1);
                    lines.push(`${idx + 1},"${member.userName}",${((member.workedMinutes || 0) / 60).toFixed(2)}h,${member.daysPresent},${((member.overtimeMinutes || 0) / 60).toFixed(2)}h,${contribution}%`);
                });
                lines.push('');
            }
        });
    }

    // Footer
    lines.push('');
    lines.push('='.repeat(80));
    lines.push('Fin du rapport');
    lines.push('='.repeat(80));

    return lines.join('\n');
}

export function downloadCSV(csvContent: string, filename: string) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
