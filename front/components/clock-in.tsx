"use client"

import { cn } from "@/lib/utils"
import { PlayCircle } from "lucide-react"
import React from "react"
import { useClockIn } from "@/hooks/clockin"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Field, FieldDescription, FieldError } from "./ui/field"

export function ClockIn({ className, disabled = false, onSuccess, onError, ...props }: React.ComponentProps<"div"> & { disabled?: boolean; onSuccess?: () => void; onError?: (err: unknown) => void }) {
  const { clockIn, loading, error } = useClockIn()

  const handleClockIn = async () => {
    try {
      await clockIn()
      onSuccess?.()
    } catch (err) {
      console.log("clockin failed", err)
      onError?.(err)
    }
  }

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && (e.key.toLowerCase() === "i")) {
        if (!disabled && !loading) {
          e.preventDefault()
          handleClockIn()
        }
      }
    }
    globalThis.addEventListener("keydown", onKey)
    return () => globalThis.removeEventListener("keydown", onKey)
  }, [disabled, loading])

  return (
    <div className={cn("@container/card", className)} {...props}>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <PlayCircle className="size-5 text-emerald-500" />
            Commencer ma journée
          </CardTitle>
          <CardDescription>Enregistrez votre arrivée en un clic.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Field>
            {(() => {
              let label = "Commencer ma journée (Alt+I)"
              if (loading) label = "Pointage en cours…"
              else if (disabled) label = "Déjà pointé aujourd'hui"
              return (
                <Button onClick={handleClockIn} disabled={disabled || loading} className="w-full bg-emerald-600 hover:bg-emerald-600/90 text-white">
                  {label}
                </Button>
              )
            })()}
            {error && (
              <FieldError className="mt-2">Une erreur est survenue. Réessayez.</FieldError>
            )}
            <FieldDescription className="mt-1">Raccourci: Alt + I</FieldDescription>
          </Field>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background:radial-gradient(500px_200px_at_bottom_left,theme(colors.emerald/20),transparent_60%)]" />
        </CardContent>
      </Card>
    </div>
  )
}