"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import SignupLink from "./links/signup-link"
import { useLogin } from "@/hooks/login";
import { useRouter } from "next/navigation";
import { Clock, Mail, Lock, AlertCircle, Sparkles } from "lucide-react";
import { toast } from "sonner"


export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, loading, error } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    // Validate password length
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.", {
        position: "bottom-right",
        richColors: true,
      });
      return;
    }

    try {
      const user = await login(
        formData.get("email") as string,
        password,
      );

      console.log("User logged:", user);
      router.push("/dashboard")
    } catch (err) {
      console.error("Log in failed:", err);
    }
  };

  const isFormValid = email.trim() !== "" && password.trim() !== "";


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-background/95 py-0">
        <CardContent className="grid p-0 lg:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-center">BIENVENUE</h1>
              <p className="text-muted-foreground text-center text-balance">
                Connectez-vous à votre compte Time Manager
              </p>
            </div>

            {error?.message && (
              <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm font-medium">{error.message}</p>
              </div>
            )}

            <FieldGroup className="space-y-2">
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">Adresse Mail</FieldLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </Field>

              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="password" className="text-sm font-medium">Mot de passe</FieldLabel>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline underline-offset-2 font-medium"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    placeholder="********"
                    className="pl-10 h-11"
                  />
                </div>
                {passwordError && (
                  <FieldDescription className="text-destructive text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {passwordError}
                  </FieldDescription>
                )}
              </Field>

              <Button
                type="submit"
                disabled={!isFormValid || loading}
                className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
              {/*TODO: handle OAuth2.0*/}
              {/*<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or continue with</FieldSeparator>*/}
              {/*<Field className="grid grid-cols-3 gap-4">*/}
              {/*  <Button variant="outline" type="button">*/}
              {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">*/}
              {/*      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" fill="currentColor" />*/}
              {/*    </svg>*/}
              {/*    <span className="sr-only">Login with Apple</span>*/}
              {/*  </Button>*/}
              {/*  <Button variant="outline" type="button">*/}
              {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">*/}
              {/*      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />*/}
              {/*    </svg>*/}
              {/*    <span className="sr-only">Login with Google</span>*/}
              {/*  </Button>*/}
              {/*  <Button variant="outline" type="button">*/}
              {/*    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">*/}
              {/*      <path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z" fill="currentColor" />*/}
              {/*    </svg>*/}
            </FieldGroup>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Pas de compte ?{" "}
                <SignupLink />
              </p>
            </div>
          </form>

          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background relative hidden lg:flex items-center justify-center p-12">
            <div className="relative z-10 space-y-6 text-center max-w-md">
              <div className="inline-flex rounded-full bg-background/80 backdrop-blur-sm p-4 shadow-lg">
                <Clock className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Time Management
                <br />
                <span className="text-primary">Faire Simple</span>
              </h2>
              <p className="text-muted-foreground text-balance leading-relaxed">
                Suivez votre temps, gérez vos équipes et boostez votre productivité avec notre plateforme intuitive.
              </p>
            </div>
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_85%)]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
