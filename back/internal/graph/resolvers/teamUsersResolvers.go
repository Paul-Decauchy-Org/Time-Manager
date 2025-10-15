package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	teamUsersQuery "github.com/epitech/timemanager/internal/repositories/queryRepository/teamUsersQueries"
)


func (r *queryResolver) UsersByTeam(ctx context.Context, teamID string) ([]*model.UserWithAllData, error) {
	return teamUsersQuery.ListUsersWithAllDataByTeam(teamID)
}