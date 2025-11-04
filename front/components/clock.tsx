"use client"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { CalendarDays, Clock3 } from "lucide-react"

export function Clock({ className, ...props }: React.ComponentProps<"div">) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const date = now.toLocaleDateString()

  return (
    <div className={cn(className)} {...props}>
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock3 className="size-4" /> Heure actuelle
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-6">
          <div className="text-primary text-4xl font-semibold tracking-tight">
            {time}
          </div>
          <div className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <CalendarDays className="size-4" />
            {date}
          </div>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background:radial-gradient(600px_200px_at_top_right,theme(colors.primary/20),transparent_60%)]" />
        </CardContent>
      </Card>
    </div>
  )
}