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

func (s *AdminService) UpdateUser(id string, input model.UpdateUserInput)(*model.User, error){
	return s.AdminRepo.UpdateUser(id, input)
}

func (s *AdminService) DeleteUser(id string)(bool, error){
	return s.AdminRepo.DeleteUser(id)
}

func (s *AdminService) GetUser(id string)(*model.UserWithAllData, error){
	return s.AdminRepo.GetUser(id)
}

func (s *AdminService) SetManagerTeam(userID string, teamID string)(*model.Team, error){
	return s.AdminRepo.SetManagerTeam(userID, teamID)
}