package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
)

func (r *mutationResolver) CreateUser(ctx context.Context, input model.CreateUserInput)(*model.User, error){
	if err := middlewares.VerifyAdmin(ctx); err != nil {
		return nil, err
	}
	return r.AdminService.CreateUser(input)
}

func (r *mutationResolver) UpdateUser(ctx context.Context, id string, input model.UpdateUserInput) (*model.User, error) {
	if err := middlewares.VerifyAdmin(ctx); err != nil {
		return nil, err
	}
	return r.AdminService.UpdateUser(id, input)
}

func (r *mutationResolver) DeleteUser(ctx context.Context, id string)(bool, error){
	if err := middlewares.VerifyAdmin(ctx); err != nil {
		return false, err
	}
	return r.AdminService.DeleteUser(id)
}

func (r *queryResolver) GetUser(ctx context.Context, id string)(*model.UserWithAllData, error){
	if err := middlewares.VerifyAdmin(ctx); err != nil {
		return nil, err
	}
	return r.AdminService.GetUser(id)
}