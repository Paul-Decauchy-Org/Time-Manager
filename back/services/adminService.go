package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
)

type AdminRepo interface {
	CreateUser(model.CreateUserInput) (*model.User, error)
	UpdateUser(string, model.UpdateUserInput) (*model.User, error)
	DeleteUser(string) (bool, error)
	GetUser(string) (*model.UserWithAllData, error)
	SetManagerTeam(string, string) (*model.Team, error)
	SetRole(string, model.Role) (*model.User, error)
	SetTimeTable(string, string) (*model.TimeTable, error)
}

type AdminService struct {
	AdminRepo AdminRepo
}

func NewAdminService(repo AdminRepo) *AdminService {
	return &AdminService{AdminRepo: repo}
}

func (s *AdminService) CreateUser(input model.CreateUserInput) (*model.User, error) {
	return s.AdminRepo.CreateUser(input)
}

func (s *AdminService) UpdateUser(id string, input model.UpdateUserInput) (*model.User, error) {
	return s.AdminRepo.UpdateUser(id, input)
}

func (s *AdminService) DeleteUser(id string) (bool, error) {
	return s.AdminRepo.DeleteUser(id)
}

func (s *AdminService) GetUser(id string) (*model.UserWithAllData, error) {
	return s.AdminRepo.GetUser(id)
}

func (s *AdminService) SetManagerTeam(userID string, teamID string) (*model.Team, error) {
	return s.AdminRepo.SetManagerTeam(userID, teamID)
}

func (s *AdminService) SetRole(userID string, role model.Role) (*model.User, error) {
	return s.AdminRepo.SetRole(userID, role)
}

func (s *AdminService) SetTimeTable(start, end string) (*model.TimeTable, error) {
	return s.AdminRepo.SetTimeTable(start, end)
}
