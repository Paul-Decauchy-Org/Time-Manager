"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export default function KpiIndexPage() {
  const { isAdmin, isManager, user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (isAdmin) router.replace("/dashboard/kpi/admin")
    else if (isManager) router.replace("/dashboard/kpi/team")
    else if (user) router.replace("/dashboard/kpi/user")
  }, [isAdmin, isManager, user, loading, router])

  return (
    React.createElement(
      "div",
      { className: "p-6 grid gap-6 md:grid-cols-3" },
      React.createElement(
        "a",
        { href: "/dashboard/kpi/user", className: "block rounded-xl border p-6 shadow-sm hover:shadow-md transition" },
        React.createElement("div", { className: "text-lg font-semibold" }, "KPIs Utilisateur"),
        React.createElement("div", { className: "text-muted-foreground text-sm" }, "Vos heures, ponctualite, presence"),
      ),
      React.createElement(
        "a",
        { href: "/dashboard/kpi/team", className: "block rounded-xl border p-6 shadow-sm hover:shadow-md transition" },
        React.createElement("div", { className: "text-lg font-semibold" }, "KPIs Equipe"),
        React.createElement("div", { className: "text-muted-foreground text-sm" }, "Vue manager: charge et couverture"),
      ),
      React.createElement(
        "a",
        { href: "/dashboard/kpi/admin", className: "block rounded-xl border p-6 shadow-sm hover:shadow-md transition" },
        React.createElement("div", { className: "text-lg font-semibold" }, "KPIs Admin"),
        React.createElement("div", { className: "text-muted-foreground text-sm" }, "Vue globale: utilisateurs et equipes"),
      )
    )
  )
}
