package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
)

type AuthRepository interface {
	SignUp(input model.SignUpInput) (*model.User, error)
	Login(email, password string) (*model.User, error)
	Me(email string) (*model.SignedUser, error)
	UpdateProfile(email string, input model.UpdateProfileInput) (*model.User, error)
	DeleteProfile(email string) (bool, error)
}

type AuthService struct {
	AuthRepo AuthRepository
	TokenGen func(email, id, role string) (string, error)
}

func NewAuthService(repo AuthRepository) *AuthService {
	return &AuthService{AuthRepo: repo, TokenGen: middlewares.GenerateToken}
}

func (s *AuthService) SignUp(input model.SignUpInput) (*model.User, error) {
	return s.AuthRepo.SignUp(input)
}

func (s *AuthService) Login(email, password string) (*model.UserLogged, error) {
	user, err := s.AuthRepo.Login(email, password)
	if err != nil {
		return nil, err
	}
	token, err := s.TokenGen(user.Email, user.ID, string(user.Role))
	if err != nil {
		return nil, err
	}
	return &model.UserLogged{
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Email:     user.Email,
		Phone:     user.Phone,
		Role:      user.Role,
		Token:     token,
	}, nil
}

func (s *AuthService) Me(email string) (*model.SignedUser, error) {
	return s.AuthRepo.Me(email)
}

func (s *AuthService) UpdateProfile(email string, input model.UpdateProfileInput) (*model.User, error) {
	return s.AuthRepo.UpdateProfile(email, input)
}

func (s *AuthService) DeleteProfile(email string) (bool, error) {
	return s.AuthRepo.DeleteProfile(email)
}
