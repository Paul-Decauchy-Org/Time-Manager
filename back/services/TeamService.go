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