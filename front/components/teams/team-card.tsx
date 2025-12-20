'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MemberAvatar } from './member-avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Users, Edit, Trash2 } from 'lucide-react';
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { TeamMembersModal } from './team-members-modal';
import { useTeamMembers } from '@/hooks/teams/use-team-members';

interface TeamCardProps {
  team: any;
  onEdit?: () => void;
  onDelete?: () => void;
  isManager?: boolean;
}

export function TeamCard({ team, onEdit, onDelete, isManager = false }: TeamCardProps) {
  const [showModal, setShowModal] = useState(false);
  
  const {
    members,
    loading,
    isUserPresent,
    addMembers,
    removeMember,
  } = useTeamMembers(team.id);

  const handleAddMembers = async (userIds: string[]) => {
    const result = await addMembers(userIds);
    if (result.success) {
      toast.success("Membres ajoutés", {
        description: `${userIds.length} membre(s) ajouté(s) à l'équipe.`,
      });
    } else {
      toast.error("Erreur lors de l'ajout", {
        description: "Impossible d'ajouter les membres. Veuillez réessayer.",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const result = await removeMember(userId);
    if (result.success) {
      toast.success("Membre retiré", {
        description: "Le membre a été retiré de l'équipe.",
      });
    } else {
      toast.error("Erreur lors du retrait", {
        description: "Impossible de retirer le membre. Veuillez réessayer.",
      });
    }
  };

  const displayedMembers = members.slice(0, 5);
  const remainingCount = members.length - 5;
  const presentCount = members.filter(m => isUserPresent(m.id) === 'present').length;
  const absentCount = members.filter(m => isUserPresent(m.id) === 'absent').length;
  const workingCount = members.filter(m => isUserPresent(m.id) === 'working').length;

  return (
    <>
      <Card className="hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1" onClick={() => setShowModal(true)}>
              <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
              <CardDescription className="mt-1.5 line-clamp-2">
                {team.description}
              </CardDescription>
            </div>
            
            {isManager && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Manager: {team.managerID?.firstName} {team.managerID?.lastName}</span>
          </div>
        </CardHeader>

        <CardContent className="relative" onClick={() => setShowModal(true)}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Membres de l'équipe</span>
              <Badge variant="secondary" className="font-semibold">
                {members.length} {members.length > 1 ? 'membres' : 'membre'}
              </Badge>
            </div>

            {loading ? (
              <div className="text-sm text-muted-foreground">Chargement...</div>
            ) : members.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucun membre</div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  {displayedMembers.map((member) => (
                    <MemberAvatar
                      key={member.id}
                      user={member}
                      presence={isUserPresent(member.id)}
                      size="md"
                    />
                  ))}
                  {remainingCount > 0 && (
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border-2 border-background">
                      +{remainingCount}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>{presentCount} présent(s)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                    <span>{absentCount} absent(s)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <TeamMembersModal
              open={showModal}
              onOpenChange={setShowModal}
              team={team}
              onMemberPresence={isUserPresent}
              onRemoveMember={handleRemoveMember}
              onAddMembers={handleAddMembers}
              isManager={isManager}/>
    </>
  );
}