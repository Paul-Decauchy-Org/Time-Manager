"use client"

import React from "react"
import { useAuth } from "@/contexts/AuthContext"
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { KpiTeamSummaryDocument, TeamsDocument, AllUsersDocument } from "@/generated/graphql"
import { print } from "graphql"
import { Users, UsersRound, UserCog, Shield, CalendarRange, LineChart } from "lucide-react"

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

function mergeCoverage(arrays: Array<Array<{ time: string; count: number }>>) {
  const map = new Map<string, number>()
  for (const a of arrays) {
    for (const { time, count } of a) {
      map.set(time, (map.get(time) || 0) + Number(count))
    }
  }
  return Array.from(map.entries())
    .map(([time, count]) => ({ time, count }))
    .sort((x, y) => x.time.localeCompare(y.time))
}

const COLORS: Record<string, { bg: string; iconBg: string; icon: string; value: string }> = {
  violet: { bg: "bg-violet-50", iconBg: "bg-violet-100", icon: "text-violet-600", value: "text-violet-700" },
  blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", icon: "text-blue-600", value: "text-blue-700" },
  emerald: { bg: "bg-emerald-50", iconBg: "bg-emerald-100", icon: "text-emerald-600", value: "text-emerald-700" },
  rose: { bg: "bg-rose-50", iconBg: "bg-rose-100", icon: "text-rose-600", value: "text-rose-700" },
  slate: { bg: "bg-slate-50", iconBg: "bg-slate-100", icon: "text-slate-600", value: "text-slate-700" },
  amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", icon: "text-amber-600", value: "text-amber-700" },
}

function StatCard(IconComp: any, label: string, value: string | number, colorKey: keyof typeof COLORS) {
  const c = COLORS[colorKey]
  return React.createElement(
    "div",
    { className: `rounded-xl border p-4 shadow-sm bg-muted` },
    React.createElement(
      "div",
      { className: "flex items-center justify-between" },
      React.createElement(
        "div",
        { className: "flex items-center gap-3" },
        React.createElement(
          "div",
            { className: `h-9 w-9 rounded-full flex items-center justify-center ${c.iconBg}` },
          React.createElement(IconComp, { className: `h-5 w-5 ${c.icon}` })
        ),
        React.createElement("div", null,
          React.createElement("div", { className: "text-sm text-muted-foreground" }, label),
          React.createElement("div", { className: `text-2xl font-semibold leading-tight ${c.value}` }, String(value))
        )
      )
    )
  )
}

export default function AdminKpiPage() {
  const { user, isManager } = useAuth()
  const [preset, setPreset] = React.useState<string>("30d")
  const { from, to } = rangeFromPreset(preset)

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [usersCount, setUsersCount] = React.useState<number>(0)
  const [teamsCount, setTeamsCount] = React.useState<number>(0)
  const [managersCount, setManagersCount] = React.useState<number>(0)
  const [adminsCount, setAdminsCount] = React.useState<number>(0)
  const [basicUsersCount, setBasicUsersCount] = React.useState<number>(0)
  const [coverage, setCoverage] = React.useState<Array<{ time: string; count: number }>>([])
  const [teams, setTeams] = React.useState<any[]>([])

  // Load base counts and teams
  React.useEffect(() => {
    let cancelled = false
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const endpoint = process.env.NEXT_PUBLIC_SCHEMA_URL as string
        const qUsers = print(AllUsersDocument as any)
        const qTeams = print(TeamsDocument as any)
        const [ru, rt] = await Promise.all([
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ query: qUsers }) }),
          fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ query: qTeams }) }),
        ])
  const ju = await ru.json()
  const jt = await rt.json()
        const allUsers: any[] = ju?.data?.UsersWithAllData ?? []
        const allTeams: any[] = jt?.data?.teams ?? []
        const filtered = allTeams.filter((t) => !isManager || t.managerID?.id === user?.id)
        if (!cancelled) {
          setUsersCount(allUsers.length)
          setTeamsCount(filtered.length)
          setTeams(filtered)
          const mgr = allUsers.filter((u) => u.role === "MANAGER").length
          const adm = allUsers.filter((u) => u.role === "ADMIN").length
          const basic = allUsers.filter((u) => u.role === "USER").length
          setManagersCount(mgr)
          setAdminsCount(adm)
          setBasicUsersCount(basic)
        }
      } catch (e: any) {
        if (!cancelled) setError(String(e.message ?? e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [user?.id, isManager])

  // Load merged coverage for selected period
  React.useEffect(() => {
    let cancelled = false
    async function teamCoverage(endpoint: string, kpiQuery: string, teamID: string, from: string, to: string) {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ query: kpiQuery, variables: { teamID, from, to } }),
      })
      const j = await r.json()
      const arr = j?.data?.kpiTeamSummary?.coverage ?? []
      return arr.map((c: any) => ({ time: String(c.time), count: Number(c.count) }))
    }
    async function run() {
      if (!teams.length) { setCoverage([]); return }
      try {
        const endpoint = process.env.NEXT_PUBLIC_SCHEMA_URL as string
        const kpiQuery = print(KpiTeamSummaryDocument as any)
        const results = await Promise.all(teams.map((t) => teamCoverage(endpoint, kpiQuery, t.id, from, to)))
        if (!cancelled) setCoverage(mergeCoverage(results))
      } catch (e: any) {
        if (!cancelled) setError(String(e.message ?? e))
      }
    }
    run()
    return () => { cancelled = true }
  }, [teams, from, to])

  const fmtTick = (t: string) => {
    // t is ISO; show compact local date
    try {
      const d = new Date(t)
      return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`
    } catch { return t }
  }

  let status: string | null = null
  if (loading) status = "Chargement..."
  else if (error) status = `Erreur: ${error}`

  return React.createElement(
    "div",
    null,
    React.createElement("div", { className: "p-6" },
      React.createElement("div", { className: "flex items-center justify-between mb-4" },
        React.createElement("div", { className: "text-2xl font-semibold" }, "KPIs Admin"),
        React.createElement("div", { className: "hidden md:flex items-center gap-2" },
          React.createElement("button", { className: `h-8 rounded-md border px-3 text-sm ${preset === "7d" ? "bg-accent" : "hover:bg-accent/60"}` , onClick: () => setPreset("7d") }, "7 jours"),
          React.createElement("button", { className: `h-8 rounded-md border px-3 text-sm ${preset === "30d" ? "bg-accent" : "hover:bg-accent/60"}` , onClick: () => setPreset("30d") }, "30 jours"),
          React.createElement("button", { className: `h-8 rounded-md border px-3 text-sm ${preset === "90d" ? "bg-accent" : "hover:bg-accent/60"}` , onClick: () => setPreset("90d") }, "90 jours"),
        )
      ),
      React.createElement("div", { className: "grid gap-4 grid-cols-1 md:grid-cols-3 mb-6" },
        StatCard(Users, "Utilisateurs", usersCount, "violet"),
        StatCard(UsersRound, "Equipes (portée)", teamsCount, "blue"),
        (function () {
          const PeriodIcon = CalendarRange
          return React.createElement(
            "div",
            { className: `rounded-xl border p-4 shadow-sm bg-muted` },
            React.createElement("div", { className: "flex items-center gap-3" },
              React.createElement("div", { className: `h-9 w-9 rounded-full flex items-center justify-center ${COLORS.slate.iconBg}` },
                React.createElement(PeriodIcon, { className: `h-5 w-5 ${COLORS.slate.icon}` })
              ),
              React.createElement("div", null,
                React.createElement("div", { className: "text-sm text-muted-foreground" }, "Periode"),
                React.createElement("div", { className: `text-base font-medium ${COLORS.slate.value}` }, `${from} - ${to}`)
              )
            )
          )
        })()
      ),
      React.createElement("div", { className: "grid gap-4 grid-cols-1 md:grid-cols-4 mb-6" },
        StatCard(UserCog, "Managers", managersCount, "emerald"),
        StatCard(Shield, "Admins", adminsCount, "rose"),
        StatCard(Users, "Users", basicUsersCount, "blue"),
      ),
      React.createElement("div", { className: "rounded-xl border p-4 shadow-sm mb-6 bg-muted" },
        React.createElement("div", { className: "flex items-center gap-2 text-lg font-semibold mb-2" },
          React.createElement(LineChart, { className: "h-5 w-5 text-muted-foreground" }),
          "Couverture globale (somme des equipes)"
        ),
        React.createElement(ChartContainer as any, { config: { count: { label: "Presence", color: "var(--primary)" } }, className: "aspect-auto h-[260px] w-full" },
          React.createElement(AreaChart as any, { data: coverage },
            React.createElement("defs", null,
              React.createElement("linearGradient", { id: "fillAdminCount", x1: "0", y1: "0", x2: "0", y2: "1" },
                React.createElement("stop", { offset: "5%", stopColor: "var(--color-count)", stopOpacity: 0.8 }),
                React.createElement("stop", { offset: "95%", stopColor: "var(--color-count)", stopOpacity: 0.1 }),
              )
            ),
            React.createElement(CartesianGrid as any, { vertical: false }),
            React.createElement(XAxis as any, { dataKey: "time", tickLine: false, axisLine: false, tickMargin: 8, minTickGap: 16, tickFormatter: fmtTick }),
            React.createElement(ChartTooltip as any, { cursor: false, content: React.createElement(ChartTooltipContent as any, { indicator: "dot" }) }),
            React.createElement(Area as any, { dataKey: "count", type: "natural", fill: "url(#fillAdminCount)", stroke: "var(--color-count)" })
          )
        )
      ),
      status ? React.createElement("div", { className: "pt-3 text-destructive" }, status) : null
    )
  )
}
