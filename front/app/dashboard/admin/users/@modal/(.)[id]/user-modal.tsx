"use client";

import { type ComponentRef, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
import {} from "@/components/ui/input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Modal from "@/components/modal";
import type { User, UserWithAllData } from "@/generated/graphql";
import UpdateForm from "@/components/user/update";
import { useAdminUser } from "@/hooks/admin/users";
import { useRouter } from "next/navigation";

type UserModalProps = { user: UserWithAllData};

export function UserModal({ user: initialUser }: UserModalProps) {
  const router = useRouter()

  function onOpenChange(open: boolean): void {
    router.back()
  }

  const title = "Update User";
  const description = "Update user data";

  // Show nothing while user is loading or missing
  if (initialUser == undefined) return null;

  return (
    <Modal title={title} description={description} onOpenChange={onOpenChange}>
      <UpdateForm user={initialUser} />
    </Modal>
  );

}
