"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel, } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import LoginLink from "../links/login-link"
import React, { use, useState } from "react";
import { useSignUp } from "@/hooks/signup";
import { useRouter } from "next/navigation";
import { Clock, Mail, Phone, User, Lock, AlertCircle, Sparkles, RollerCoaster } from "lucide-react";
import { toast } from "sonner";
import { Role, type UserWithAllData } from "@/generated/graphql";
import { useAdminUpdateUser } from "@/hooks/admin/users";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type UpdateFormProps = React.ComponentProps<"div"> & { user?: UserWithAllData };

export default function UpdateForm({
    user,
    className,
    ...props
}: UpdateFormProps) {
    const { adminUpdateUser, loading, error } = useAdminUpdateUser();
    const router = useRouter()
 console.log("USER", user)
    // États pour les champs du formulaire
    const [id, setId] = useState(user?.id ?? "");
    const [firstName, setFirstName] = useState(user?.firstName ?? "");
    const [lastName, setLastName] = useState(user?.lastName ?? "");
    const [email, setEmail] = useState(user?.email ?? "");
    const [phone, setPhone] = useState(user?.phone ?? "");
    const [role, setRole] = useState(user?.role ?? Role.User)


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const user = await adminUpdateUser({
                id,
                firstName,
                lastName,
                email,
                phone,
                role
            });

            console.log("User Updated:", user);
            toast.success("User updated!", {
                description: "Successfully updated user account",
                position: "top-center",
                richColors: true,
            });
            
        } catch (err) {
            console.error("Update failed:", err);
            toast.error("Update failed", {
                description: "Please try again later.",
                position: "top-center",
                richColors: true,
            });
        }
    };

    const isFormValid =
        firstName.trim() !== "" &&
        lastName.trim() !== "" &&
        email.trim() !== "" &&
        phone.trim() !== "";


    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden py-0" >
                <CardContent className="grid p-0" >
                    <form className="p-8 md:p-12 space-y-2" onSubmit={handleSubmit} >
                        <div className="space-y-2" >
                            <div className="flex items-center justify-center gap-2 mb-2" >
                                <div className="rounded-full bg-primary/10 p-3" >
                                    <Clock className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                        </div>

                        {
                            error && (
                                <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2" >
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm font-medium" > {error.message} </p>
                                </div>
                            )
                        }

                        <FieldGroup className="space-y-2" >
                            <div className="grid grid-cols-2 gap-4" >
                                <Field>
                                    <FieldLabel htmlFor="firstName" className="text-sm font-medium" > First Name </FieldLabel>
                                    < div className="relative" >
                                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            placeholder="John"
                                            required
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)
                                            }
                                            disabled={loading}
                                            className="pl-10 h-11"
                                        />
                                    </div>
                                </Field>
                                < Field >
                                    <FieldLabel htmlFor="lastName" className="text-sm font-medium" > Last Name </FieldLabel>
                                    < div className="relative" >
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

                            < Field >
                                <FieldLabel htmlFor="email" className="text-sm font-medium" > Email address </FieldLabel>
                                < div className="relative" >
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

                            < Field >
                                <FieldLabel htmlFor="phone" className="text-sm font-medium" > Phone number </FieldLabel>
                                < div className="relative" >
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"

                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        disabled={loading}
                                        className="pl-10 h-11"
                                    />
                                </div>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="role" className="text-sm font-medium">
                                    Role
                                </FieldLabel>

                                <div className="relative">
                                    <Select
                                        value={user?.role ?? undefined}
                                        onValueChange={(value) => setRole(value as Role)}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value={Role.Admin}>Admin</SelectItem>
                                            <SelectItem value={Role.User}>User</SelectItem>
                                            <SelectItem value={Role.Manager}>Manager</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </Field>


                            <Button type="submit" disabled={!isFormValid || loading} className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all" >
                                {
                                    loading ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                            Updating account...
                                        </>
                                    ) : (
                                        "Update Account"
                                    )
                                }
                            </Button>
                        </FieldGroup>

                    </form>
                </CardContent>
            </Card>

        </div>
    );
}