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