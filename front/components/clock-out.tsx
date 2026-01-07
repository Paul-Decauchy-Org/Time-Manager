"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { SquarePower } from "lucide-react";
import React from "react";
import { useClockOut } from "@/hooks/clockout";

export function ClockOut({
  className,
  disabled = false,
  onSuccess,
  onError,
  ...props
}: React.ComponentProps<"div"> & {
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}) {
  const { clockOut, loading, error } = useClockOut();

  const handleClockOut = async () => {
    try {
      await clockOut();
      onSuccess?.();
    } catch (err) {
      console.log("clockout failed", err);
      onError?.(err);
    }
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "o") {
        if (!disabled && !loading) {
          e.preventDefault();
          handleClockOut();
        }
      }
    };
    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, [disabled, loading]);

  return (
    <div className={cn("@container/card", className)} {...props}>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <SquarePower className="size-5 text-rose-500" />
            Finir ma journée
          </CardTitle>
          <CardDescription>
            {" "}
            Enregistrez votre départ en un clic.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Field>
            {(() => {
              let label = "Finir ma journée (ALT+O)";
              if (loading) label = "Pointage en cours…";
              else if (disabled) label = "Déjà clôturé aujourd'hui";
              return (
                <Button
                  onClick={handleClockOut}
                  disabled={disabled || loading}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  {label}
                </Button>
              );
            })()}
            {error && (
              <FieldError className="mt-2">
                {" "}
                Impossible de clôturer.Réessayez.
              </FieldError>
            )}
            <FieldDescription className="mt-1">
              {" "}
              Raccourci: Alt + O{" "}
            </FieldDescription>
          </Field>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-50 [background:radial-gradient(500px_200px_at_bottom_right,theme(colors.rose/20),transparent_60%)]" />
        </CardContent>
      </Card>
    </div>
  );
}
