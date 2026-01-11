"use client";

import { useKpiCSV } from "@/hooks/kpiCSV";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function KPICSV() {
  const { data, loading, error } = useKpiCSV();
  const [downloading, setDownloading] = useState(false);

  function handleClick() {
    if (!data?.exportUserKpiCSV) {
      console.error("No CSV data available");
      return;
    }

    try {
      setDownloading(true);

      // Créer le blob avec le CSV
      const blob = new Blob([data.exportUserKpiCSV], {
        type: "text/csv;charset=utf-8;",
      });

      // Créer l'URL et le lien de téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      // Nom du fichier avec date
      const date = new Date().toISOString().split("T")[0];
      link.href = url;
      link.download = `kpi-report-${date}.csv`;
      
      // Télécharger
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading CSV:", err);
    } finally {
      setDownloading(false);
    }
  }

  // Afficher les erreurs
  if (error) {
    return (
      <Button variant="destructive" disabled>
        Erreur de chargement
      </Button>
    );
  }

  // Bouton de chargement
  if (loading) {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Chargement...
      </Button>
    );
  }

  // Bouton de téléchargement
  return (
    <Button 
      onClick={handleClick} 
      disabled={downloading || !data?.exportUserKpiCSV}
    >
      {downloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Téléchargement...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Télécharger KPI
        </>
      )}
    </Button>
  );
}