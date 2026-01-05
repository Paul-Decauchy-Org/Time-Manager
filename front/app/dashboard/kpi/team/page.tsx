"use client"

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Heatmap } from "@/components/heatmap"
import { Users, Clock, AlertTriangle, TrendingUp } from "lucide-react"
import { KpiTeamSummaryDocument, AllUsersDocument, TeamsDocument } from "@/generated/graphql"
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"

function getEntriesForTeam(users: any[], teamID: string, from: string, to: string) {
    const members = users.filter((u) => (u.teams || []).some((tm: any) => tm.id === teamID))
    const fromD = new Date(from)
    const toD = new Date(to)
    const out: any[] = []
    for (const u of members) {
        const list = u.timeTableEntries || []
        for (const e of list) {
            const withUser = { ...e, user: u }
            let day: Date | null = null
            if (e.day) day = new Date(e.day)
            else if (e.arrival) day = new Date(e.arrival)
            else if (e.departure) day = new Date(e.departure)
            if (!day) continue
            if (day >= fromD && day <= toD) out.push(withUser)
        }
    }
    return out
}

// Helpers to reduce complexity of computeTeamDerived
function isLate(arrival: Date, thresholdHour: number) {
    return arrival.getHours() > thresholdHour || (arrival.getHours() === thresholdHour && arrival.getMinutes() > 0)
}

function addDaily(total: Record<string, number>, day: Date, arrival: Date | null, departure: Date | null) {
    if (!arrival || !departure) return
    const mins = Math.max(0, Math.round((departure.getTime() - arrival.getTime()) / 60000))
    const key = day.toISOString().slice(0, 10)
    total[key] = (total[key] || 0) + mins
}

function buildDailyArray(dailyTotals: Record<string, number>) {
    return Object.entries(dailyTotals)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, minutes]) => ({ date, minutes }))
}

function pushHeat(heat: number[][], day: Date, hour: number) {
    heat[day.getDay()][hour] += 1
}

function aggregateEntries(entries: any[], thresholdHour: number) {
    const lateByUser: Record<string, number> = {}
    const dailyTotals: Record<string, number> = {}
    const heat: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0))
    let lateCount = 0
    let totalEntries = 0
    for (const e of entries) {
        const arrival = e.arrival ? new Date(e.arrival) : null
        const departure = e.departure ? new Date(e.departure) : null
        const day = e.day ? new Date(e.day) : (arrival || departure)
        if (!day) continue
        addDaily(dailyTotals, day, arrival, departure)
        if (!arrival) continue
        totalEntries++
        if (!isLate(arrival, thresholdHour)) continue
        lateCount++
        const k = e.user?.id || "unknown"
        lateByUser[k] = (lateByUser[k] || 0) + 1
        pushHeat(heat, day, arrival.getHours())
    }
    return { lateByUser, dailyTotals, heat, lateCount, totalEntries }
}

function computeTeamDerived(entries: any[]) {
    const thresholdHour = 10
    const { lateByUser, dailyTotals, heat, lateCount, totalEntries } = aggregateEntries(entries, thresholdHour)
    const heatCells: { r: number; c: number; v: number }[] = []
    for (let r = 0; r < heat.length; r++) for (let c = 0; c < heat[r].length; c++) heatCells.push({ r, c, v: heat[r][c] })
    const latenessRate = totalEntries ? lateCount / totalEntries : 0
    const dailyArr = buildDailyArray(dailyTotals)
    const topLateName = Object.keys(lateByUser).length
        ? (() => {
            const topId = Object.entries(lateByUser).sort((a, b) => b[1] - a[1])[0][0]
            const sample = entries.find((x: any) => x.user?.id === topId)?.user
            return sample ? `${sample.firstName} ${sample.lastName}` : "-"
        })()
        : "-"
    return { latenessRate, topLateName, dailyArr, heatCells }
}

function rangeFromPreset(preset: string): { from: string; to: string } {
    const toDate = new Date()
    const to = toDate.toISOString().slice(0, 10)
    const daysMap: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 }
    const days = daysMap[preset] ?? 30
    const fromDate = new Date()
    fromDate.setDate(toDate.getDate() - days)
    const from = fromDate.toISOString().slice(0, 10)
    return { from, to }
}

function formatMinutes(mins: number) {
    const h = Math.floor(mins / 60)
    const m = Math.max(0, mins % 60)
    return `${h}h${m.toString().padStart(2, "0")}`
}

type Preset = "7d" | "30d" | "90d"
const PRESETS: Preset[] = ["7d", "30d", "90d"]
const PRESET_LABELS: Record<Preset, string> = { "7d": "7 jours", "30d": "30 jours", "90d": "90 jours" }

export default async function TeamKpiPage() {
    const { user, isManager } = useAuth()
    const clientRef = React.useRef<any>(null)
    if (!clientRef.current) {
        clientRef.current = new ApolloClient({
            link: new HttpLink({ uri: process.env.NEXT_PUBLIC_SCHEMA_URL as string, credentials: "include", fetchOptions: { cache: "no-store", mode: "cors", credentials: "include" } }),
            cache: new InMemoryCache(),
            defaultOptions: { query: { fetchPolicy: "no-cache" }, watchQuery: { fetchPolicy: "no-cache" } },
        })
    }
    const [preset, setPreset] = React.useState<Preset>("30d")
    const { from, to } = rangeFromPreset(preset)

    // Local UI state
    const [error, setError] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [teams, setTeams] = React.useState<any[]>([])
    const [teamID, setTeamID] = React.useState<string | null>(null)

    React.useEffect(() => {
        let cancelled = false
        async function run() {
            try {
                const res = await clientRef.current.query({ query: TeamsDocument as any, fetchPolicy: "no-cache" })
                const fetched: any[] = res?.data?.teams ?? []
                if (!cancelled) {
                    setTeams(fetched)
                    if (!teamID && fetched.length) {
                        const initial = fetched.find((x) => !isManager || x.managerID?.id === user?.id) || fetched[0]
                        if (initial) {
                            setTeamID(initial.id)
                        }
                    }
                }
            } catch (e: any) {
                if (!cancelled) setError(String(e.message || e))
            }
        }
        run()
        return () => { cancelled = true }
    }, [isManager, user?.id, teamID])

    const [summary, setSummary] = React.useState<any>(null)
    const [teamEntries, setTeamEntries] = React.useState<any[]>([])
    React.useEffect(() => {
        let cancelled = false
        async function run() {
            if (!teamID) return
            setLoading(true)
            try {
                const kpiRes = await clientRef.current.query({ query: KpiTeamSummaryDocument as any, variables: { teamID, from, to }, fetchPolicy: "no-cache" })
                if (!cancelled) setSummary(kpiRes?.data?.kpiTeamSummary)
                const usersRes = await clientRef.current.query({ query: AllUsersDocument as any, fetchPolicy: "no-cache" })
                const users: any[] = usersRes?.data?.UsersWithAllData ?? []
                const entries = getEntriesForTeam(users, teamID, from, to)
                if (!cancelled) setTeamEntries(entries)
            } catch (e: any) {
                if (!cancelled) setError(String(e.message || e))
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        run()
        return () => { cancelled = true }
    }, [teamID, from, to])

    const cov = (summary?.coverage ?? []).map((c: any) => ({ time: String(c.time), count: Number(c.count) }))

    const { latenessRate, topLateName, dailyArr, heatCells } = computeTeamDerived(teamEntries)

    const teamsToShow = teams.filter((t) => !isManager || t.managerID?.id === user?.id)
    const selectedTeamId: string | undefined = React.useMemo(() => {
        return teamID ?? teamsToShow[0]?.id
    }, [teamID, teamsToShow]) || undefined
    const teamName = React.useMemo(() => {
        const t = teams.find((x) => x.id === selectedTeamId)
        return t?.name || ""
    }, [teams, selectedTeamId])

    const header = React.createElement(
        "div",
        { className: "flex items-center justify-between gap-3 p-6" },
        React.createElement("div", null,
            React.createElement("div", { className: "text-2xl font-semibold" }, "KPIs Equipe"),
            React.createElement("div", { className: "text-muted-foreground text-sm" }, `Equipe: ${teamName || "-"}`),
            React.createElement("div", { className: "text-muted-foreground text-sm" }, `Periode: ${from} - ${to}`)
        ),
        React.createElement("div", { className: "flex items-center gap-2" },
            React.createElement(Select as any, {
                value: selectedTeamId,
                onValueChange: (id: string) => {
                    if (id === "no-teams") return
                    setTeamID(id)
                }
            },
                React.createElement(SelectTrigger as any, { size: "sm", className: "w-[280px]", disabled: teamsToShow.length === 0 },
                    React.createElement(SelectValue as any, { placeholder: teamsToShow.length === 0 ? "Aucune équipe" : "Sélectionner une équipe" })
                ),
                React.createElement(SelectContent as any, null,
                    ...(teamsToShow.length === 0
                        ? [React.createElement(SelectItem as any, { key: "none", value: "no-teams", disabled: true }, "Aucune équipe")]
                        : teamsToShow.map((t) => React.createElement(SelectItem as any, { key: t.id, value: t.id }, t.name))
                    )
                )
            ),
            ...PRESETS.map((p) =>
                React.createElement("button", {
                    key: p,
                    className: `h-8 rounded-md border px-3 text-sm ${preset === p ? "bg-accent" : ""}`,
                    onClick: () => setPreset(p),
                }, PRESET_LABELS[p])
            ),
        )
    )

    const statCards = [
        {
            key: "total",
            container: "rounded-xl border p-4 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/20",
            iconRow: "flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300",
            icon: Clock,
            label: "Total minutes",
            value: summary ? formatMinutes(Number(summary.totalWorkedMinutes)) : "-",
        },
        {
            key: "avg",
            container: "rounded-xl border p-4 shadow-sm bg-sky-50/50 dark:bg-sky-950/20",
            iconRow: "flex items-center gap-2 text-sm text-sky-700 dark:text-sky-300",
            icon: TrendingUp,
            label: "Moyenne / user",
            value: summary ? formatMinutes(Math.round(Number(summary.avgWorkedMinutesPerUser || 0))) : "-",
        },
        {
            key: "active",
            container: "rounded-xl border p-4 shadow-sm bg-amber-50/50 dark:bg-amber-950/20",
            iconRow: "flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300",
            icon: Users,
            label: "Utilisateurs actifs",
            value: summary ? String(Number(summary.activeUsers)) : "-",
        },
        {
            key: "late",
            container: "rounded-xl border p-4 shadow-sm bg-rose-50/50 dark:bg-rose-950/20",
            iconRow: "flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300",
            icon: AlertTriangle,
            label: "Taux de retard",
            value: `${Math.round(latenessRate * 100)}%`,
        },
    ] as const

    const cards = React.createElement(
        "div",
        { className: "grid gap-4 grid-cols-1 md:grid-cols-3 px-6 mb-6" },
        ...statCards.map((c) =>
            React.createElement(
                "div",
                { key: c.key, className: c.container },
                React.createElement(
                    "div",
                    { className: c.iconRow },
                    React.createElement(c.icon as any, { className: "size-4" }),
                    c.label
                ),
                React.createElement("div", { className: "text-xl font-semibold" }, c.value)
            )
        ),
        React.createElement("div", { className: "rounded-xl border p-4 shadow-sm bg-purple-50/50 dark:bg-purple-950/20 md:col-span-2" },
            React.createElement("div", { className: "text-sm text-muted-foreground" }, "Plus en retard"),
            React.createElement("div", { className: "text-xl font-semibold" }, topLateName)
        ),
    )

    const chart = React.createElement(
        "div",
        { className: "px-6 mb-6" },
        React.createElement("div", { className: "rounded-xl border p-4 shadow-sm" },
            React.createElement("div", { className: "text-lg font-semibold mb-2" }, "Couverture horaire"),
            React.createElement(ChartContainer as any, { config: { count: { label: "Presence", color: "var(--primary)" } }, className: "aspect-auto h-[260px] w-full" },
                React.createElement(AreaChart as any, { data: cov },
                    React.createElement("defs", null,
                        React.createElement("linearGradient", { id: "fillCount", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "var(--color-count)", stopOpacity: 0.8 }),
                            React.createElement("stop", { offset: "95%", stopColor: "var(--color-count)", stopOpacity: 0.1 }),
                        )
                    ),
                    React.createElement(CartesianGrid as any, { vertical: false }),
                    React.createElement(XAxis as any, { dataKey: "time", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 16 }),
                    React.createElement(ChartTooltip as any, { cursor: false, content: React.createElement(ChartTooltipContent as any, { indicator: "dot" }) }),
                    React.createElement(Area as any, { dataKey: "count", type: "natural", fill: "url(#fillCount)", stroke: "var(--color-count)" })
                )
            )
        )
    )

    const chart2 = React.createElement(
        "div",
        { className: "px-6 mb-6" },
        React.createElement("div", { className: "rounded-xl border p-4 shadow-sm" },
            React.createElement("div", { className: "text-lg font-semibold mb-2" }, "Minutes par jour"),
            React.createElement(ChartContainer as any, { config: { minutes: { label: "Minutes", color: "hsla(180, 90%, 45%, 0.45)" } }, className: "aspect-auto h-[260px] w-full" },
                React.createElement(BarChart as any, { data: dailyArr },
                    React.createElement(CartesianGrid as any, { vertical: false }),
                    React.createElement(XAxis as any, { dataKey: "date", tickLine: true, axisLine: true, tickMargin: 8, minTickGap: 8 }),
                    React.createElement(YAxis as any, { hide: false }),
                    React.createElement(ChartTooltip as any, { cursor: { fill: "hsl(210 90% 45% / .05)" }, content: React.createElement(ChartTooltipContent as any, { indicator: "dot" }) }),
                    React.createElement(Bar as any, { dataKey: "minutes", fill: "var(--color-minutes)", radius: [6, 6, 0, 0] })
                )
            )
        )
    )

    const heatmap = React.createElement(
        "div",
        { className: "px-6 mb-6" },
        React.createElement(Heatmap as any, {
            rows: 7,
            cols: 31,
            data: heatCells,
            max: Math.max(1, Math.max(...heatCells.map((c) => c.v))),
            rowLabels: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
            title: "Retards par jour (heatmap)",
        })
    )

    let status: string | null = null
    if (loading) status = "Chargement..."
    else if (error) status = `Erreur: ${error}`

    return React.createElement(
        "div",
        null,
        header,
        cards,
        chart,
        chart2,
        heatmap,
        status ? React.createElement("div", { className: "px-6 py-3 text-destructive" }, status) : null
    )
}
