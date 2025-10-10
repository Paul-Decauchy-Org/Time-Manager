package resolvers

import (
	"context"
	"fmt"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories/mutationRepository/userMutations"
	"github.com/epitech/timemanager/internal/repositories/queryRepository/userQueries"
)

// Users resolver
func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	return userQueries.ListUsers()
}

// UserByEmail implements graph.QueryResolver.
func (r *queryResolver) UserByEmail(ctx context.Context, email string) (*model.User, error) {
	return userQueries.GetUserByEmail(email)
}

// UsersByGroup implements graph.QueryResolver.
func (r *queryResolver) UsersByGroup(ctx context.Context, inGroup bool) ([]*model.User, error) {
	return userQueries.GetUsersByGroup(inGroup)
}

// CreateUser resolver
func (r *mutationResolver) CreateUser(ctx context.Context, input model.CreateUserInput) (*model.User, error) {
	return userMutations.CreateUserInput(input)
}

func (r *mutationResolver) CreateMassiveUsers(ctx context.Context, input model.CreateMassiveUsersInput) ([]*model.User, error) {
	users := make([]model.CreateUserInput, len(input.Users))
	for i, u := range input.Users {
		users[i] = *u
	}
	return userMutations.CreateMassiveUsers(users)
}

// UpdateUser resolver
func (r *mutationResolver) UpdateUser(ctx context.Context, id string, input model.UpdateUserInput) (*model.User, error) {
	return nil, fmt.Errorf("UpdateUser not implemented in repositories")
}

// DeleteUser resolver
func (r *mutationResolver) DeleteUser(ctx context.Context, id string) (bool, error) {
	return false, fmt.Errorf("DeleteUser not implemented in repositories")
}
