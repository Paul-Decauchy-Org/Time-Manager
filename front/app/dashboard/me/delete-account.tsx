"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useDeleteProfile } from "@/hooks/delete-profile";

export function DeleteAccount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { deleteProfile, loading, error } = useDeleteProfile();
  const [errorPass, setErrorPass] = useState("");
  const [confirmText, setConfirmText] = useState("");

  const handleDelete = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorPass("");

    const formData = new FormData(e.currentTarget);
    const confirmation = formData.get("confirmation") as string;

    // Validate confirmation text
    if (confirmation !== "DELETE") {
      setErrorPass("Please type DELETE to confirm");
      return;
    }

    try {
      await deleteProfile();
      console.log("Account deletion requested");

      router.push("/login");
    } catch (err) {
      console.error("Account deletion failed:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 min-w-max", className)} {...props}>
      <Card className="overflow-hidden p-0 border-destructive">
        <CardContent className="gap-2">
          <form className="p-6 md:p-8" onSubmit={handleDelete}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-destructive">
                  Delete Account
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </p>
              </div>

              {errorPass && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm" >
                  {errorPass}
                </div>
              )}

              <Field>
                <FieldLabel htmlFor="confirmation">
                  Type DELETE to confirm
                </FieldLabel>
                <Input
                  id="confirmation"
                  name="confirmation"
                  type="text"
                  placeholder="DELETE"
                  required
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={loading}
                />
                <FieldDescription>
                  Please type DELETE in all caps to confirm account deletion.
                </FieldDescription>
              </Field>

              <Field role="field">
                <Button
                  type="submit"
                  role="delete"
                  disabled={loading || confirmText !== "DELETE"}
                  variant="destructive"
                  className="w-full"
                >
                  {loading
                    ? "Deleting Account..."
                    : "Delete Account Permanently"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
