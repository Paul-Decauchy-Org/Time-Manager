package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
)

// TeamRepository is the minimal contract used by TeamService.
type TeamRepository interface {
	GetTeamUsers() []*model.TeamUser
	CreateTeam(input model.CreateTeamInput) (*model.Team, error)
	UpdateTeam(id string, input model.UpdateTeamInput) (*model.Team, error)
	DeleteTeam(id string) (bool, error)
	GetTeam(id string) (*model.Team, error)
	GetTeams() ([]*model.Team, error)
	AddUsersToTeam(input model.AddUsersToTeamInput) ([]*model.TeamUser, error)
	RemoveUserFromTeam(userID string, teamID string) (bool, error)
	AddUserToTeam(userID string, teamID string) (*model.TeamUser, error)
}

type TeamService struct {
	TeamRepo TeamRepository
}

func (s *TeamService) GetTeamUsers() []*model.TeamUser {
	return s.TeamRepo.GetTeamUsers()
}

func NewTeamService(repo TeamRepository) *TeamService {
	return &TeamService{TeamRepo: repo}
}

func (s *TeamService) CreateTeam(input model.CreateTeamInput) (*model.Team, error) {
	return s.TeamRepo.CreateTeam(input)
}

func (s *TeamService) UpdateTeam(id string, input model.UpdateTeamInput) (*model.Team, error) {
	return s.TeamRepo.UpdateTeam(id, input)
}

func (s *TeamService) DeleteTeam(id string) (bool, error) {
	return s.TeamRepo.DeleteTeam(id)
}

func (s *TeamService) GetTeam(id string) (*model.Team, error) {
	return s.TeamRepo.GetTeam(id)
}

func (s *TeamService) GetTeams() ([]*model.Team, error) {
	return s.TeamRepo.GetTeams()
}

func (s *TeamService) AddUsersToTeam(input model.AddUsersToTeamInput) ([]*model.TeamUser, error) {
	return s.TeamRepo.AddUsersToTeam(input)
}

func (s *TeamService) RemoveUserFromTeam(userID string, teamID string) (bool, error) {
	return s.TeamRepo.RemoveUserFromTeam(userID, teamID)
}

func (s *TeamService) AddUserToTeam(id string, teamID string) (*model.TeamUser, error) {
	return s.TeamRepo.AddUserToTeam(id, teamID)
}
