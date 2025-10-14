package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
)


type AdminService struct {
	AdminRepo *repositories.Repository
}

func NewAdminService(repo *repositories.Repository)*AdminService{
	return &AdminService{AdminRepo: repo}
}

func (s *AdminService) CreateUser(input model.CreateUserInput)(*model.User, error){
	return s.AdminRepo.CreateUser(input)
}