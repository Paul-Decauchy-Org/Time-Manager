// auth resolvers
package resolvers

import (
	"context"
	"errors"
	"net/http"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
)

// signUp resolver
func (r * mutationResolver) SignUp(ctx context.Context, input model.SignUpInput) (*model.User, error) {
	return r.AuthService.SignUp(input)
}

// login resolver
func (r * mutationResolver) Login(ctx context.Context, email, password string) (*model.UserLogged, error) {
	userLogged, err := r.AuthService.Login(email, password)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}
	if w, ok := ctx.Value("ResponseWriter").(http.ResponseWriter); ok {
        http.SetCookie(w, &http.Cookie{
            Name:     "token",
            Value:    userLogged.Token,
            Path:     "/",
            HttpOnly: true,
            MaxAge:   3600 * 24,
        })
    }
	return userLogged, nil
}

// Logout resolver
func (r * mutationResolver) Logout(ctx context.Context) (string, error) {
	w, ok := ctx.Value("ResponseWriter").(http.ResponseWriter)
	if !ok {
		return "", errors.New("could not find ResponseWriter in context")
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1, 
	})

	return "Logged out successfully", nil
}

// Get profile resolver
func (r * queryResolver) Me(ctx context.Context) (*model.User, error) {
	email, ok := ctx.Value(middlewares.ContextUserEmailKey).(string)
	if !ok {
		return nil, errors.New("could not find email in context")
	}
	return r.AuthService.Me(email)
}

// Update profile resolver
func (r * mutationResolver) UpdateProfile(ctx context.Context, input model.UpdateProfileInput)(*model.User, error){
	email, ok := ctx.Value(middlewares.ContextUserEmailKey).(string)
	if !ok {
		return nil, errors.New("could not find email in context")
	}
	return r.AuthService.UpdateProfile(email, input)
}
