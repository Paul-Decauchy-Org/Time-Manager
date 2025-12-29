import React, {ReactNode} from "react";
import {
    Dialog,

    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";


interface ModalProps {
    title: string;
    description: string;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

export default function Modal({ title, description, onOpenChange, children }: ModalProps) {
    return (
        <Dialog defaultOpen={true} open={true} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline">Share</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    );
}