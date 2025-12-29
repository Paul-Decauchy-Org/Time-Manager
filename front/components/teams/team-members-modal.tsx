'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MemberAvatar } from './member-avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, UserPlus, Mail, Phone, Loader2, X } from 'lucide-react';
import { AddMemberDialog } from './add-member-dialog';
import { UsersByTeamDocument } from '@/generated/graphql';
import { useQuery } from '@apollo/client/react';

interface TeamMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: any;
  onMemberPresence: (userId: string) => 'present' | 'absent' | 'working';
  onRemoveMember: (userId: string) => Promise<void>;
  onAddMembers: (userIds: string[]) => Promise<void>;
  isManager?: boolean;
}

export function TeamMembersModal({
  open,
  onOpenChange,
  team,
  onMemberPresence,
  onRemoveMember,
  onAddMembers,
  isManager = false,
}: TeamMembersModalProps) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(UsersByTeamDocument, {
    variables: { teamID: team.id },
    skip: !open,
  });

  const members = data?.usersByTeam || [];

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await onRemoveMember(userId);
      await refetch();
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddMembers = async (userIds: string[]) => {
    await onAddMembers(userIds);
    await refetch();
    setAddMemberOpen(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} modal>
        <DialogContent 
          className="max-w-4xl max-h-[80vh]"
          onEscapeKeyDown={handleClose}
          onPointerDownOutside={handleClose}
          onInteractOutside={handleClose}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{team.name}</DialogTitle>
                <DialogDescription>{team.description}</DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full -mt-2 -mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  Membres de l'équipe ({members.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Gérez les membres de votre équipe
                </p>
              </div>
              {isManager && (
                <Button onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Ajouter des membres
                </Button>
              )}
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membre</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    {isManager && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isManager ? 5 : 4} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="text-muted-foreground">Chargement des membres...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={isManager ? 5 : 4} className="text-center py-8 text-destructive">
                        <p>Erreur lors du chargement des membres</p>
                        <p className="text-sm mt-2">{error.message}</p>
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isManager ? 5 : 4} className="text-center py-8 text-muted-foreground">
                        Aucun membre dans cette équipe
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <MemberAvatar
                              user={member}
                              presence={onMemberPresence(member.id)}
                              size="sm"
                              showTooltip={false}
                            />
                            <div>
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                            {member.phone && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className='bg-violet-500 text-white border-violet-600'>
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {onMemberPresence(member.id) === 'present' ? (
                            <Badge className="bg-green-400 text-white">Présent</Badge>
                          ) : onMemberPresence(member.id) === 'working' ? (
                            <Badge className="bg-blue-400 text-white">En activité</Badge>
                          ) : (
                            <Badge className="bg-orange-500 text-white">Absent</Badge>
                          )}
                        </TableCell>
                        {isManager && (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemove(member.id)}
                              disabled={removingId === member.id}
                              className="hover:bg-destructive hover:text-destructive-foreground"
                            >
                              {removingId === member.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        teamName={team.name}
        teamId={team.id}
        onAddMembers={handleAddMembers}
      />
    </>
  );
}