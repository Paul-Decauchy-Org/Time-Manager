package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
)

type TeamService struct {
	TeamRepo *repositories.Repository
}

func NewTeamService(repo *repositories.Repository) *TeamService{
	return &TeamService{TeamRepo: repo}
}

func (s *TeamService) CreateTeam(input model.CreateTeamInput)(*model.Team, error){
	return s.TeamRepo.CreateTeam(input)
}

func (s *TeamService) UpdateTeam(id string, input model.UpdateTeamInput)(*model.Team, error){
	return s.TeamRepo.UpdateTeam(id, input)
}

func (s *TeamService) DeleteTeam(id string)(bool, error){
	return s.TeamRepo.DeleteTeam(id)
}

func (s *TeamService) GetTeam(id string)(*model.Team, error){
	return s.TeamRepo.GetTeam(id)
}

func (s *TeamService) GetTeams()([]*model.Team, error){
	return s.TeamRepo.GetTeams()
}

func (s *TeamService) AddUserToTeam(id string, teamID string)(*model.TeamUser, error){
	return s.TeamRepo.AddUserToTeam(id, teamID)
}

func (s *TeamService) AddUsersToTeam(input model.AddUsersToTeamInput)([]*model.TeamUser, error){
	return s.TeamRepo.AddUsersToTeam(input)
}