package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
	"github.com/epitech/timemanager/package/middlewares"
)


type AuthService struct {
	AuthRepo *repositories.Repository
}
func NewAuthService(repo *repositories.Repository) *AuthService {
	return &AuthService{AuthRepo: repo}
}

func (s *AuthService) SignUp(input model.SignUpInput) (*model.User, error) {
	return s.AuthRepo.SignUp(input)
}

func (s *AuthService) Login(email, password string) (*model.UserLogged, error) {
	user, err := s.AuthRepo.Login(email, password)
	if err != nil {
		return nil, err
	}
	token, err := middlewares.GenerateToken(user.Email, user.ID)
	if err != nil {
		return nil, err
	}
	return &model.UserLogged{
		FirstName: user.FirstName,
		LastName: user.LastName,
		Email: user.Email,
		Phone: user.Phone,
		Role: user.Role,
		Token: token,
	}, nil
}