"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/update-profile";
import {
  User,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// Validation configuration (UI messages, not credentials)
const MIN_PASSWORD_LENGTH = 8;
// sonar.issue.ignore.multicriteria: e1
// sonar.issue.ignore.multicriteria.e1.ruleKey: typescript:S2068
// sonar.issue.ignore.multicriteria.e1.resourceKey: **/*
const VALIDATION_MESSAGES = {
  PASSWORD_TOO_SHORT: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`, // NOSONAR - UI validation message
  PASSWORDS_DO_NOT_MATCH: "Les mots de passe ne correspondent pas", // NOSONAR - UI validation message
} as const;

export function ProfileInfo({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user } = useAuth();
  const { updateProfile, loading, error } = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    confirmPassword: "",
  });

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (formData.password && formData.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = VALIDATION_MESSAGES.PASSWORD_TOO_SHORT;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = VALIDATION_MESSAGES.PASSWORDS_DO_NOT_MATCH;
    }

    return errors;
  }, [formData.password, formData.confirmPassword]);

  const isFormValid = useMemo(() => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      Object.keys(validation).length === 0
    );
  }, [formData, validation]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdate = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!isFormValid) {
        toast.error("Veuillez corriger les erreurs du formulaire", {
          position: "bottom-right",
        });
        return;
      }

      try {
        await updateProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        toast.success("Profil mis à jour avec succès !", {
          position: "bottom-right",
          icon: <CheckCircle2 className="h-4 w-4" />,
        });

        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } catch (err) {
        console.error("Update profile failed:", err);
        toast.error("Échec de la mise à jour du profil", {
          position: "bottom-right",
        });
      }
    },
    [formData, isFormValid, updateProfile],
  );

  return (
    <div
      className={cn("flex flex-col gap-6 w-full max-w-4xl mx-auto", className)}
      {...props}
    >
      <Card className="overflow-hidden border shadow-lg">
        <CardHeader className="space-y-1 bg-gradient-to-br from-primary/5 via-primary/3 to-background border-b">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {" "}
                Informations du profil{" "}
              </CardTitle>
              <CardDescription>
                Mettez à jour vos informations personnelles
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium"> {error.message} </p>
              </div>
            )}

            <FieldGroup className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="firstName"
                    className="text-sm font-medium"
                  >
                    Prénom
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="lastName"
                    className="text-sm font-medium"
                  >
                    Nom
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  Adresse Email
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
                <FieldDescription className="text-xs">
                  Nous utiliserons cette adresse pour vous contacter.Votre email
                  ne sera pas partagé.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">
                  Numéro de téléphone
                </FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    required
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {/* NOSONAR - UI label, not a credential */}
                    Changement de mot de passe(optionnel)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Nouveau mot de passe
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Nouveau mot de passe"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                  {validation.password && (
                    <FieldDescription className="text-destructive text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {validation.password}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirmer le mot de passe
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </Field>
                </div>
                {passwordError ? (
                  <FieldDescription role='alert' className="text-destructive">
                    {passwordError}
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                )}

              <Field role="field">
                <Button type="submit" role = 'submit' disabled={loading} className="w-full">
                  {loading ? "Updating Account..." : "Update Profile"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
