package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories/mutationRepository/teamMutations"
	"github.com/epitech/timemanager/package/middlewares"
)

func (r *queryResolver) GetTeams(ctx context.Context) ([]*model.Team, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.GetTeams()
}

func (r *mutationResolver) CreateTeam(ctx context.Context, input model.CreateTeamInput) (*model.Team, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.CreateTeam(input)
}

func (r *mutationResolver) UpdateTeam(ctx context.Context, id string, input model.UpdateTeamInput) (*model.Team, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.UpdateTeam(id, input)
}

func (r *mutationResolver) DeleteTeam(ctx context.Context, id string) (bool, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return false, err
	}
	return r.TeamService.DeleteTeam(id)
}

func (r *queryResolver) GetTeam(ctx context.Context, id string)(*model.Team, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.GetTeam(id)
}

func (r *mutationResolver) AddUserToTeam(ctx context.Context, userID string, teamID string) (*model.TeamUser, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.AddUserToTeam(userID, teamID)
}

func (r *mutationResolver) AddUsersToTeam(ctx context.Context, input model.AddUsersToTeamInput) ([]*model.TeamUser, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	return r.TeamService.AddUsersToTeam(input)
}

func (r *mutationResolver) RemoveUserFromTeam(ctx context.Context, userID string, teamID string) (bool, error) {
	return teamMutations.RemoveUserFromTeam(userID, teamID)
}
