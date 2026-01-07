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
import { useUpdateProfile } from "@/hooks/update-profile";

export  function ProfileInfo({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user } = useAuth();
  const { updateProfile, loading, error } = useUpdateProfile();
  const [passwordError, setPasswordError] = useState("");
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
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
    if (password.length < 8 && password != "") {
      setPasswordError("Password must be at least 8 characters long");
      return;
    }

    try {
      console.log(formData.get("phone")?.toString());
      const user = await updateProfile({
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        email: formData.get("email") as string,
        phone: formData.get("phone") as string,
        password: password,
      });

      console.log("User updated:", user);
    } catch (err) {
      console.error("Update profile failed:", err);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6 min-w-max", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="gap-2">
          <form className="p-6 md:p-8" onSubmit={handleUpdate}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Update your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Profile Info
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
                  {error.message}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    required
                    defaultValue={user?.firstName}
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    required
                    defaultValue={user?.lastName}
                    disabled={loading}
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  defaultValue={user?.email}
                  disabled={loading}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  defaultValue={user?.phone}
                  disabled={loading}
                />
              </Field>

              <Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      disabled={loading}
                    />
                    <FieldDescription>
                      Leave it empty to only update other fields.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      disabled={loading}
                    />
                  </Field>
                </div>
                {passwordError ? (
                  <FieldDescription className="text-destructive">
                    {passwordError}
                  </FieldDescription>
                ) : (
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                )}
              </Field>

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
