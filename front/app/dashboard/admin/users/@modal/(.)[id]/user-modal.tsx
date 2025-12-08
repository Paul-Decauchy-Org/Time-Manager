"use client";

import { type ComponentRef, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {} from "@/components/ui/input";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Modal from "@/components/modal";

export function UserModal() {
  const router = useRouter();
  function onOpenChange(open: boolean) : void {
    router.back();
  }
  const title = "Update User";
  const description="Update user data"
  return (
      <Modal
          title={title}
          description={description}
          onOpenChange={onOpenChange}>
          Salut
      </Modal>
  )

}
