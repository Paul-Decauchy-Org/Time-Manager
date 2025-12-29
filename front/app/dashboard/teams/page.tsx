'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeams } from '@/hooks/teams/use-teams';
import { TeamCard } from '@/components/teams/team-card';
import { TeamFormDialog } from '@/components/teams/team-form-dialog';
import { Button } from '@/components/ui/button';
import { Plus, Users, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TeamsPage() {
  const { user, isManager } = useAuth();
  const { teams, loading: loadingTeams, createTeam, updateTeam, deleteTeam, error: teamsError } = useTeams();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<any | null>(null);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Teams Debug:', {
      user,
      isManager,
      teams,
      loadingTeams,
      teamsError,
    });
  }, [user, isManager, teams, loadingTeams, teamsError]);

  // Filter teams managed by the current user if they're a manager
  const myTeams = isManager
    ? teams.filter((team) => team.managerID?.id === user?.id)
    : teams;

  const handleCreateTeam = async (data: { name: string; description: string; managerId: string }) => {
    console.log('Creating team:', data);
    const result = await createTeam({
      name: data.name,
      description: data.description,
      managerID: data.managerId,
    });
    console.log('Team creation result:', result);
    
    if (result) {
      toast.success("Équipe créée avec succès", {
        description: `L'équipe "${data.name}" a été créée.`,
      });
    } else {
      toast.error("Erreur lors de la création", {
        description: "Impossible de créer l'équipe. Veuillez réessayer.",
      });
    }
  };

  const handleUpdateTeam = async (data: { name: string; description: string; managerId: string }) => {
    if (!editingTeam) return;
    const result = await updateTeam(editingTeam.id, {
      name: data.name,
      description: data.description,
    });
    
    if (result) {
      toast.success("Équipe modifiée", {
        description: `Les modifications ont été enregistrées.`,
      });
      setEditingTeam(null);
    } else {
      toast.error("Erreur lors de la modification", {
        description: "Impossible de modifier l'équipe. Veuillez réessayer.",
      });
    }
  };

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return;
    const result = await deleteTeam(deletingTeam.id);
    
    if (result) {
      toast.success("Équipe supprimée", {
        description: `L'équipe "${deletingTeam.name}" a été supprimée.`,
      });
      setDeletingTeam(null);
    } else {
      toast.error("Erreur lors de la suppression", {
        description: "Impossible de supprimer l'équipe. Veuillez réessayer.",
      });
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormDialogOpen(true);
  };

  if (loadingTeams) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement des équipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Équipes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos équipes et suivez la présence de vos collaborateurs
          </p>
        </div>
        {isManager && (
          <Button onClick={() => {
            setEditingTeam(null);
            setFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Créer une équipe
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total d'équipes</p>
              <p className="text-2xl font-bold">{myTeams.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-3">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Équipes actives</p>
              <p className="text-2xl font-bold">{myTeams.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/10 p-3">
              <Users className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Vos équipes</p>
              <p className="text-2xl font-bold">{myTeams.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {myTeams.length === 0 ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune équipe</h3>
          <p className="text-muted-foreground mb-4">
            {isManager
              ? 'Commencez par créer votre première équipe'
              : 'Vous n\'êtes membre d\'aucune équipe pour le moment'}
          </p>
          {isManager && (
            <Button onClick={() => setFormDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une équipe
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myTeams.map((team) => (
            <TeamCard
                  key={team.id}
                  team={team}
                  onEdit={() => handleEdit(team)}
                  onDelete={() => setDeletingTeam(team)}
                  isManager={isManager}/>
          ))}
        </div>
      )}

      {/* Modals */}
      <TeamFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        team={editingTeam}
        managerId={user?.id || ''}
        onSubmit={editingTeam ? handleUpdateTeam : handleCreateTeam}
      />

      <AlertDialog open={!!deletingTeam} onOpenChange={() => setDeletingTeam(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprimera définitivement l'équipe "{deletingTeam?.name}".
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTeam} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}