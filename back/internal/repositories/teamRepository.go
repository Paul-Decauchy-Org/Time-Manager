package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
)

func (r *Repository) CreateTeam(input model.CreateTeamInput)(*model.Team, error){
	var existingTeam *dbmodels.Team

	if err := r.DB.Where("name = ?", input.Name).First(&existingTeam).Error; err == nil {
		return nil, errors.New("team's name is already in use")
	}

	managerID, ok := uuid.Parse(input.ManagerID)

	if ok != nil {
		return nil, errors.New("error while parsing manager ID")
	}
	var user *dbmodels.User
	if err := r.DB.Where("id = ?", managerID).First(&user).Error; err != nil {
		return nil, errors.New("manager not found")
	}
	team := &dbmodels.Team{
		Name: input.Name,
		Description: input.Description,
		ManagerID: managerID,
	}
	
	if err := r.DB.Create(team).Error; err != nil {
		return nil, errors.New("error while creating team")
	}
	return teamMapper.DBTeamToGraph(team), nil
}

func (r *Repository) UpdateTeam(id string, input model.UpdateTeamInput)(*model.Team, error){
	teamID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", teamID).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	if input.Name != nil {
		existingTeam.Name = *input.Name
	}
	if input.Description != nil {
		existingTeam.Description = *input.Description
	}
	if input.ManagerID != nil {
		managerID, ok := uuid.Parse(*input.ManagerID)
		if ok != nil {
			return nil, errors.New("error while parsing manager id")
		}
		existingTeam.ManagerID = managerID
	}
	if err := r.DB.Save(existingTeam).Error; err != nil {
		return nil, errors.New("error while updating team")
	}
	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) DeleteTeam(id string)(bool, error){
	teamID, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", teamID).First(&existingTeam).Error; err != nil {
		return false, errors.New("team not found")
	}
	if err := r.DB.Delete(&existingTeam).Error; err != nil {
		return false, errors.New("error while deleting team id")
	}
	return true, nil
}

func (r *Repository) GetTeam(id string)(*model.Team, error){
	teamID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", teamID).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) GetTeams()([]*model.Team, error){
	var teams []*dbmodels.Team
	if err := r.DB.Find(&teams).Error; err != nil {
		return nil, errors.New("can't find teams")
	}
	return teamMapper.DBTeamsToGraph(teams), nil
}