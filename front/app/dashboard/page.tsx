"use client"

import { Clock } from "@/components/clock"
import { ClockIn } from "@/components/clock-in"
import { ClockOut } from "@/components/clock-out"
import { useMemo, useState } from "react"
import { useTimeEntries } from "@/hooks/useTimeEntries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDays, LogIn, LogOut, Timer } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

function ClockHistoryCard({ timeEntries, loading, error }: Readonly<{ timeEntries: any[] | undefined; loading: boolean; error: any }>) {
    const [view, setView] = useState<"table" | "timeline">("table")
    const rows = useMemo(() => {
        return (timeEntries ?? [])
            .slice()
            .sort(
                (a: any, b: any) =>
                    new Date(b.arrival ?? b.day ?? 0).getTime() - new Date(a.arrival ?? a.day ?? 0).getTime()
            )
            .slice(0, 10)
            .map((e: any) => {
                const arrival = e.arrival ? new Date(e.arrival) : null
                const departure = e.departure ? new Date(e.departure) : null
                const day = e.day ? new Date(e.day) : arrival ?? departure
                let status = e.status as string | undefined
                if (!status) {
                    if (departure) status = "Terminé"
                    else if (arrival) status = "En cours"
                    else status = "—"
                }
                let kind: "arrival" | "departure" | "pending" = "pending"
                if (departure) kind = "departure"
                else if (arrival) kind = "arrival"
                return {
                    id: e.id ?? `${e.day}-${e.arrival}`,
                    day,
                    arrival,
                    departure,
                    dayLabel: day ? day.toLocaleDateString() : "-",
                    arrivalLabel: arrival ? arrival.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
                    departureLabel: departure ? departure.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
                    status,
                    kind,
                }
            })
    }, [timeEntries])

    const groups = useMemo(() => {
        const out: { label: string; items: any[] }[] = []
        const indexByLabel = new Map<string, number>()
        for (const r of rows) {
            const key = r.dayLabel
            if (!indexByLabel.has(key)) {
                indexByLabel.set(key, out.length)
                out.push({ label: key, items: [] })
            }
            out[indexByLabel.get(key)!].items.push(r)
        }
        return out
    }, [rows])

    const formatDuration = (a?: Date | null, d?: Date | null) => {
        if (!a || !d) return null
        const minutes = Math.max(0, Math.round((d.getTime() - a.getTime()) / 60000))
        const h = Math.floor(minutes / 60)
        const m = minutes % 60
        if (h > 0) return `${h}h${m.toString().padStart(2, "0")}`
        return `${m} min`
    }

    return (
        <Card className= "overflow-hidden" >
        <CardHeader className="border-b" >
            <CardTitle>Historique des pointages </CardTitle>
                < CardDescription > Vos 10 derniers mouvements </CardDescription>
                    </CardHeader>
                    < CardContent className = "pt-6" >
                        { loading && (
                            <div className="space-y-3" >
                            {
                                Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key= { i } className = "h-8 w-full" />
                        ))
                            }
                                </div>
                )
}
{
    !loading && error && (
        <div className="text-destructive text-sm" > Impossible de charger l'historique.</div>
                )
}
{
    !loading && !error && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border py-8 text-center text-muted-foreground" >
            <Timer className="size-6" />
                <div className="text-sm" > Aucun pointage pour le moment.</div>
                    </div>
    )
}
{
    !loading && !error && rows.length > 0 && (
        <Tabs value={ view } onValueChange = {(v) => setView(v as any)
} className = "w-full" >
    <TabsList className="mb-4" style = {{ "width": "50%" }}>
        <TabsTrigger value="table" className = "py-2" > Tableau </TabsTrigger>
            < TabsTrigger value = "timeline" className = "py-2" > Timeline </TabsTrigger>
                </TabsList>
                < TabsContent value = "table" >
                    <Table className="text-md table-fixed" >
                        <TableHeader>
                        <TableRow>
                        <TableHead className="w-[200px] whitespace-nowrap" > Jour </TableHead>
                            < TableHead className = "w-[160px] whitespace-nowrap" > Arrivée </TableHead>
                                < TableHead className = "w-[160px] whitespace-nowrap" > Départ </TableHead>
                                    < TableHead className = "w-[160px] whitespace-nowrap" > Statut </TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
{
    rows.map((r: any) => {
        let variant: "default" | "secondary" | "outline" = "outline"
        if (r.status === "En cours") variant = "secondary"
        else if (r.status === "Terminé") variant = "default"
        let Icon = Timer
        if (r.kind === "departure") Icon = LogOut
        else if (r.kind === "arrival") Icon = LogIn
        return (
            <TableRow key= { r.id } className = "hover:bg-muted/50 transition" >
                <TableCell className="gap-2 border-l first:border-l-0 border-border" >
                    <div className="flex items-center gap-2" > <CalendarDays className="size-4 text-muted-foreground" />
                        { r.dayLabel } </div>
                        </TableCell>
                        < TableCell className = "border-l first:border-l-0 border-border" >
                            <div className="flex items-center gap-2" > <LogIn className="size-4 text-emerald-500" />
                                { r.arrivalLabel } </div>
                                </TableCell>
                                < TableCell className = "items-center gap-2 border-l first:border-l-0 border-border" >
                                    <div className="flex items-center gap-2" > <LogOut className="size-4 text-rose-500" />
                                        { r.departureLabel } </div>
                                        </TableCell>
                                        < TableCell >
                                        <Badge variant={ variant } className = "inline-flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm rounded-full text-white" >
                                            <Icon className="size-4" />
                                                { r.status }
                                                </Badge>
                                                </TableCell>
                                                </TableRow>
    )
})}
</TableBody>
    </Table>
    </TabsContent>
    < TabsContent value = "timeline" >
        <div className="space-y-6" >
        {
            groups.map((g, gi) => (
                <div key= {`${g.label}-${gi}`} className = "space-y-3" >
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground" >
                        <CalendarDays className="size-4" />
                            { g.label }
                            </div>
                            < ol className = "relative ms-3 border-s pl-6" >
                            {
                                g.items.map((r: any, idx: number) => {
                                    const duration = formatDuration(r.arrival, r.departure)
                                    let dotColor = "bg-muted"
                                    if (r.kind === "arrival") dotColor = "bg-emerald-500 ring-emerald-200"
                                    else if (r.kind === "departure") dotColor = "bg-rose-500 ring-rose-200"
                                    let badgeVariant: "default" | "secondary" | "outline" = "outline"
                                    if (r.status === "En cours") badgeVariant = "secondary"
                                    else if (r.status === "Terminé") badgeVariant = "default"
                                    return (
                                        <li key= { r.id ?? idx } className = "mb-5 ms-4" >
                                            <span className={ `absolute -start-2.5 mt-2 size-3 rounded-full ring-4 ${dotColor}` } />
                                                < div className = "rounded-md border bg-card p-3 shadow-sm" >
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1" >
                                                        <div className="inline-flex items-center gap-1 text-sm font-medium" >
                                                            <LogIn className="size-4 text-emerald-600" /> { r.arrivalLabel }
                                                                < span className = "text-muted-foreground" >→</span>
                                                                    < LogOut className = "size-4 text-rose-600" /> { r.departureLabel }
                                                                        </div>
                                                                        < Badge variant = { badgeVariant } className = "px-3 py-1.5 text-xs md:text-sm rounded-full" > { r.status } </Badge>
                                    {
                                        duration && (
                                            <span className="text-xs text-muted-foreground" >• { duration } </span>
                                                                )
                            }
                                </div>
                                </div>
                                </li>
                                                )
                                            })}
</ol>
    </div>
                                ))}
</div>
    </TabsContent>
    </Tabs>
                )}
</CardContent>
    </Card>
    )
}

export default function Page() {
    const { timeEntries, loading, error, refetch } = useTimeEntries()
    const { user } = useAuth()
    const filteredEntries = useMemo(() => {
        if (!user) return []
        return (timeEntries ?? []).filter((e: any) => e.userID?.id === user.id)
    }, [timeEntries, user])
    const today = new Date()
    const todayEntry = (filteredEntries ?? []).find((e: any) => {
        let d: Date | null = null
        if (e.day) d = new Date(e.day)
        else if (e.arrival) d = new Date(e.arrival)
        else if (e.departure) d = new Date(e.departure)
        return d && d.toDateString() === today.toDateString()
    })
    const hasClockedInToday = !!todayEntry?.arrival
    const hasClockedOutToday = !!todayEntry?.departure
    return (
        <div>
        <div className= "flex flex-1 flex-col gap-4 p-4 pt-0" >
        <div className="grid auto-rows-min gap-4 md:grid-cols-3" >
            <ClockIn
                        disabled={ hasClockedInToday }
    onSuccess = { async() => {
        toast.success("Arrivée enregistrée")
        try { await refetch() } catch { }
    }
}
onError = {() => toast.error("Échec de l'arrivée")}
                    />
    < ClockOut
disabled = {!hasClockedInToday || hasClockedOutToday}
onSuccess = { async() => {
    toast.success("Départ enregistré")
    try { await refetch() } catch { }
}}
onError = {() => toast.error("Échec du départ")}
                    />
    < Clock />
    </div>

    < div className = "grid gap-4 md:grid-cols-1" >
        <ClockHistoryCard timeEntries={ filteredEntries } loading = { loading } error = { error } />
            </div>
            </div>
            </div>
    )
}