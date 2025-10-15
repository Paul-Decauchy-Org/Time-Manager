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

	if err := r.DB.Where("name = ?", input.Name).First(&existingTeam).Error; err != nil {
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