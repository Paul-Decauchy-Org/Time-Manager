package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	timetableEntryMutation "github.com/epitech/timemanager/internal/repositories/mutationRepository/timeTableEntryMutations"
	"github.com/epitech/timemanager/internal/repositories/mutationRepository/userMutations"
	"github.com/epitech/timemanager/internal/repositories/queryRepository/userQueries"
	"github.com/epitech/timemanager/package/middlewares"
)

func (r *queryResolver) Users(ctx context.Context) ([]*model.User, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return userQueries.ListUsers()
}

func (r *queryResolver) UserByEmail(ctx context.Context, email string) (*model.User, error) {
	return userQueries.GetUserByEmail(email)
}

func (r *queryResolver) UsersByGroup(ctx context.Context, inGroup bool) ([]*model.User, error) {
	return userQueries.GetUsersByGroup(inGroup)
}

func (r *queryResolver) UserWithAllData(ctx context.Context, id string) (*model.UserWithAllData, error) {
	panic("unimplemented")
}

func (r *queryResolver) UsersWithAllData(ctx context.Context) ([]*model.UserWithAllData, error) {
	return userQueries.ListUsersWithAllData()
}

func (r *mutationResolver) CreateThreeUsers(ctx context.Context)([]*model.User, error){
	return userMutations.CreateThreeUsers()
}

func (r *mutationResolver) CreateMassiveUsers(ctx context.Context, input model.CreateMassiveUsersInput) ([]*model.User, error) {
	users := make([]model.CreateUserInput, len(input.Users))
	for i, u := range input.Users {
		users[i] = *u
	}
	return userMutations.CreateMassiveUsers(users)
}


func (r *mutationResolver) ClockIn(ctx context.Context) (*model.TimeTableEntry, error) {
	return timetableEntryMutation.ClockIn(ctx, r.DB)
}

func (r *mutationResolver) ClockOut(ctx context.Context) (*model.TimeTableEntry, error) {
	return timetableEntryMutation.ClockOut(ctx, r.DB)
}
