"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: any | null;
  managerId: string;
  onSubmit: (data: {
    name: string;
    description: string;
    managerId: string;
  }) => Promise<void>;
}

export function TeamFormDialog({
  open,
  onOpenChange,
  team,
  managerId,
  onSubmit,
}: TeamFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description);
    } else {
      setName("");
      setDescription("");
    }
  }, [team, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({ name, description, managerId });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {team ? "Modifier l'équipe" : "Créer une équipe"}
          </DialogTitle>
          <DialogDescription>
            {team
              ? "Modifiez les informations de votre équipe"
              : "Créez une nouvelle équipe pour organiser vos collaborateurs"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'équipe</Label>
              <Input
                id="name"
                placeholder="Ex: Équipe Marketing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez le rôle et les responsabilités de cette équipe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name || !description}
            >
              {isSubmitting
                ? team
                  ? "Modification..."
                  : "Création..."
                : team
                  ? "Modifier"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
