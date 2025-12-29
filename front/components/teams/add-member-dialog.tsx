'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { GetUsersWithoutGroupDocument } from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';
import { toast } from "sonner";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  teamId: string;
  onAddMembers: (userIds: string[]) => Promise<void>;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  teamName,
  teamId,
  onAddMembers,
}: AddMemberDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { data, loading, error } = useQuery(GetUsersWithoutGroupDocument, {
    variables: { input: false },
    skip: !open,
  });

  const availableUsers = data?.usersByGroup || [];

  const filteredUsers = availableUsers.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      toast.warning("Aucun membre sélectionné", {
        description: "Veuillez sélectionner au moins un membre.",
      });
      return;
    }
    
    setIsAdding(true);
    try {
      await onAddMembers(selectedUsers);
      setSelectedUsers([]);
      setSearchQuery('');
      onOpenChange(false);
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de l'ajout des membres.",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSelectedUsers([]);
    setSearchQuery('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter des membres à {teamName}</DialogTitle>
          <DialogDescription>
            Sélectionnez les utilisateurs sans équipe que vous souhaitez ajouter
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Chargement des utilisateurs...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-destructive">
                <p>Erreur lors du chargement des utilisateurs</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                {searchQuery
                  ? 'Aucun utilisateur trouvé'
                  : 'Aucun utilisateur disponible sans équipe'}
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleToggleUser(user.id)}
                  >
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleToggleUser(user.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
              <p className="text-sm font-medium">
                ✓ {selectedUsers.length} utilisateur(s) sélectionné(s)
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Annuler
          </Button>
          <Button
            onClick={handleAdd}
            disabled={selectedUsers.length === 0 || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              `Ajouter ${selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}