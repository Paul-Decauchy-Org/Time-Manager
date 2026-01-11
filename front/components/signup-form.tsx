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
import LoginLink from "./links/login-link";
import React, { useState } from "react";
import { useSignUp } from "@/hooks/signup";
import { useRouter } from "next/navigation";
import {
  Clock,
  Mail,
  Phone,
  User,
  Lock,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signUp, loading, error } = useSignUp();
  const router = useRouter();

  // États pour les champs du formulaire
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.", {
        position: "bottom-right",
        richColors: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      toast.error("Les mots de passe ne correspondent pas", {
        position: "top-center",
        richColors: true,
      });
      return;
    }

    try {
      const user = await signUp({
        firstName,
        lastName,
        email,
        phone,
        password,
      });

      console.log("User created:", user);
      toast.success("Compte créé avec succès !", {
        description: "Vous pouvez maintenant vous connecter",
        position: "top-center",
        richColors: true,
      });
      router.push("/login");
    } catch (err) {
      console.error("Sign up failed:", err);
      toast.error("Échec de la création du compte", {
        description: "Veuillez réessayer",
        position: "top-center",
        richColors: true,
      });
    }
  };

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    email.trim() !== "" &&
    phone.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "";

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-background/95 py-0">
        <CardContent className="grid p-0 lg:grid-cols-2">
          <form className="p-8 md:p-12 space-y-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-center">
                {" "}
                Créer votre compte{" "}
              </h1>
              <p className="text-muted-foreground text-center text-balance">
                Commencez avec Time Manager aujourd'hui
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium"> {error.message} </p>
              </div>
            )}

            <FieldGroup className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="firstName"
                    className="text-sm font-medium"
                  >
                    {" "}
                    First Name{" "}
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
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
                    {" "}
                    Last Name{" "}
                  </FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">
                  {" "}
                  Email address{" "}
                </FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">
                  {" "}
                  Phone number{" "}
                </FieldLabel>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    {" "}
                    Password{" "}
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 h-11"
                    />
                  </div>
                </Field>
              </div>

{
    passwordError ? (
        <FieldDescription role="alert" className= "text-destructive text-xs flex items-center gap-1" >
        <AlertCircle className="h-3 w-3" />
            { passwordError }
            </FieldDescription>
                            ) : (
        <FieldDescription className= "text-xs text-muted-foreground"  >
        Le mot de passe doit contenir au moins 8 caractères
            </FieldDescription>
                            )
}
<Button role="submit" type="submit" disabled = { !isFormValid || loading } className = "w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all" >
{
    loading?(
                                    <>
    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
        Creating account...
</>
                                ) : (
    "Create Account"
)
}
</Button>
    </FieldGroup>


            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account ? <LoginLink />
              </p>
            </div>
          </form>

          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background relative hidden lg:flex items-center justify-center p-12">
            <div className="relative z-10 space-y-2 max-w-md">
              <div className="inline-flex rounded-full bg-background/80 backdrop-blur-sm p-4 shadow-lg">
                <Clock className="h-16 w-16 text-primary" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">
                  Join Our Platform
                </h2>
                <p className="text-muted-foreground text-balance leading-relaxed">
                  Start managing your time effectively and collaborate with your
                  team seamlessly.
                </p>
              </div>
            </div>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
