package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
)

// create a user
func (r *mutationResolver) CreateUser(ctx context.Context, input model.CreateUserInput)(*model.User, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.CreateUser(input)
}

// update a user
func (r *mutationResolver) UpdateUser(ctx context.Context, id string, input model.UpdateUserInput) (*model.User, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.UpdateUser(id, input)
}

// delete a user
func (r *mutationResolver) DeleteUser(ctx context.Context, id string)(bool, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return false, err
	}
	return r.AdminService.DeleteUser(id)
}

// get a user
func (r *queryResolver) GetUser(ctx context.Context, id string)(*model.UserWithAllData, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.GetUser(id)
}

// set or change manager team
func (r *mutationResolver) SetManagerTeam(ctx context.Context, userID string, teamID string)(*model.Team, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.SetManagerTeam(userID, teamID)
}

// set role for a user
func (r *mutationResolver) SetRole(ctx context.Context, userID string, role model.Role)(*model.User, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.SetRole(userID, role)
}

// set timetable
func (r *mutationResolver) SetTimeTable(ctx context.Context, start, end string)(*model.TimeTable, error){
	if err := middlewares.VerifyRole(ctx, "ADMIN"); err != nil {
		return nil, err
	}
	return r.AdminService.SetTimeTable(start, end)
}