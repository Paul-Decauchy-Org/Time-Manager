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

func (s *TeamService) UpdateTeam(userID string, id string, input model.UpdateTeamInput)(*model.Team, error){
	return s.TeamRepo.UpdateTeam(userID, id, input)
}

func (s *TeamService) DeleteTeam(userID string, id string)(bool, error){
	return s.TeamRepo.DeleteTeam(userID, id)
}

func (s *TeamService) GetTeam(id string)(*model.Team, error){
	return s.TeamRepo.GetTeam(id)
}

func (s *TeamService) GetTeams()([]*model.Team, error){
	return s.TeamRepo.GetTeams()
}

func (s *TeamService) AddUserToTeam(userID string, id string, teamID string)(*model.TeamUser, error){
	return s.TeamRepo.AddUserToTeam(userID, id, teamID)
}

func (s *TeamService) AddUsersToTeam(userID string, input model.AddUsersToTeamInput)([]*model.TeamUser, error){
	return s.TeamRepo.AddUsersToTeam(userID, input)
}

func (s *TeamService) RemoveUserFromTeam(managerID string, userID string, teamID string)(bool, error){
	return s.TeamRepo.RemoveUserFromTeam(managerID, userID, teamID)
}