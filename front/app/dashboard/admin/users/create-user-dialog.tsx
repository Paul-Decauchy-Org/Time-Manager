import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import React, { useState } from "react";
import { useAdminCreateUser } from "@/hooks/admin/users";
import { Role } from "@/generated/graphql";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { error } from "console";
import { Clock, AlertCircle, User, Mail, Phone, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateUserDialog() {
  const { adminCreateUser, loading, error } = useAdminCreateUser()
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(Role.User)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const user = await adminCreateUser({
        firstName,
        lastName,
        password,
        email,
        phone,
        role
      });

      toast.success("User created!", {
        description: "Successfully created user account",
        position: "top-center",
        richColors: true,
      });

    } catch (err) {
      console.error("Creation failed:", err);
      toast.error("Creation failed", {
        description: "Please try again later.",
        position: "top-center",
        richColors: true,
      });
    }
  };

  const isFormValid =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    password.length >= 8 &&
    email.trim() !== "" &&
    phone.trim() !== "";


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
          <DialogDescription>


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
                          placeholder="06 11 11 11 11"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={loading}
                          className="pl-10 h-11"
                        />
                      </div>
                    </Field>

                    < Field >
                      <FieldLabel htmlFor="password" className="text-sm font-medium" > Pasword </FieldLabel>
                      < div className="relative" >
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="********"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
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
                          value={Role.User as string}
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

                    <DialogClose asChild>
                      <Button type="submit" disabled={!isFormValid || loading} className="w-full h-11 text-base font-semibold shadow-lg hover:shadow-xl transition-all" >
                        {
                          loading ? (
                            <>
                              <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create account"
                          )
                        }
                      </Button>
                    </DialogClose>
                  </FieldGroup>

                </form>
              </CardContent>
            </Card>



          </DialogDescription>
        </DialogHeader>

      </DialogContent>
    </Dialog>
  );
}
