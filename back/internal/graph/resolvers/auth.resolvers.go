// auth resolvers
package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
)

// signUp resolver
func (r * mutationResolver) SignUp(ctx context.Context, input model.SignUpInput) (*model.User, error) {
	return repositories.SignUp(input)
}

// login resolver
func (r * mutationResolver) Login(ctx context.Context, email, password string) (*model.User, error) {
	return repositories.Login(email, password)
}