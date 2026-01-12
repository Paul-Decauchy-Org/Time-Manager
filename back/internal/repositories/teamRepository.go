package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	teamUserMapper "github.com/epitech/timemanager/internal/mappers/teamUser"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
)

const whereIDs = "id = ?"

var teamIdParsingError = errors.New("error while parsing team ID")
var teamNotFoundErrors = errors.New("team not found")

func (r *Repository) CreateTeam(input model.CreateTeamInput) (*model.Team, error) {
	var existingTeam *dbmodels.Team

	if err := r.DB.Where("name = ?", input.Name).First(&existingTeam).Error; err == nil {
		return nil, errors.New("team's name is already in use")
	}

	managerID, ok := uuid.Parse(input.ManagerID)

	if ok != nil {
		return nil, errors.New("error while parsing manager ID")
	}
	var user *dbmodels.User
	if err := r.DB.Where(whereIDs, managerID).First(&user).Error; err != nil {
		return nil, errors.New("manager not found")
	}
	team := &dbmodels.Team{
		Name:        input.Name,
		Description: input.Description,
		ManagerID:   managerID,
	}

	if err := r.DB.Create(team).Error; err != nil {
		return nil, errors.New("error while creating team")
	}

	// Reload with Manager preloaded
	if err := r.DB.Preload("Manager").Where(whereIDs, team.ID).First(team).Error; err != nil {
		return nil, errors.New("error while reloading team")
	}

	return teamMapper.DBTeamToGraph(team), nil
}

func (r *Repository) UpdateTeam(id string, input model.UpdateTeamInput) (*model.Team, error) {
	teamID, err := uuid.Parse(id)
	if err != nil {
		return nil, teamIdParsingError
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Preload("Manager").Where(whereIDs, teamID).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundErrors
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

	// Reload with Manager preloaded
	if err := r.DB.Preload("Manager").Where(whereIDs, existingTeam.ID).First(existingTeam).Error; err != nil {
		return nil, errors.New("error while reloading team")
	}

	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) DeleteTeam(id string) (bool, error) {
	teamID, ok := uuid.Parse(id)
	if ok != nil {
		return false, teamIdParsingError
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where(whereIDs, teamID).First(&existingTeam).Error; err != nil {
		return false, teamNotFoundErrors
	}

	// Supprimer d'abord toutes les associations dans team_users
	if err := r.DB.Where("team_id = ?", teamID).Delete(&dbmodels.TeamUser{}).Error; err != nil {
		return false, errors.New("error while deleting team members")
	}

	// Ensuite supprimer l'équipe
	if err := r.DB.Delete(&existingTeam).Error; err != nil {
		return false, errors.New("error while deleting team id")
	}
	return true, nil
}

func (r *Repository) GetTeam(id string) (*model.Team, error) {
	teamID, err := uuid.Parse(id)
	if err != nil {
		return nil, teamIdParsingError
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Preload("Manager").Where(whereIDs, teamID).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundErrors
	}
	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) GetTeams() ([]*model.Team, error) {
	var teams []*dbmodels.Team
	if err := r.DB.Preload("Manager").Find(&teams).Error; err != nil {
		return nil, errors.New("can't find teams")
	}
	return teamMapper.DBTeamsToGraph(teams), nil
}

func (r *Repository) GetTeamByUUID(teamID uuid.UUID) (*model.Team, error) {
	var existingTeam *dbmodels.Team
	if err := r.DB.Preload("Manager").Where(whereIDs, teamID).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundErrors
	}
	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) AddUserToTeam(id string, teamID string) (*model.TeamUser, error) {
	userID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing userID")
	}
	idTeam, ok := uuid.Parse(teamID)
	if ok != nil {
		return nil, errors.New("error while parsing teamID")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where(whereIDs, userID).First(&existingUser).Error; err != nil {
		return nil, errors.New("user not found")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where(whereIDs, idTeam).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundErrors
	}
	var existingTeamUser *dbmodels.TeamUser
	if err := r.DB.Where(&dbmodels.TeamUser{UserID: userID, TeamID: idTeam}).First(&existingTeamUser).Error; err == nil {
		return nil, errors.New("user is already in the team")
	}
	teamUser := &dbmodels.TeamUser{
		UserID: userID,
		TeamID: idTeam,
	}
	if err := r.DB.Create(teamUser).Error; err != nil {
		return nil, errors.New("error while adding user to the team")
	}

	// Reload with User and Team preloaded using composite key
	if err := r.DB.Preload("User").Preload("Team").Preload("Team.Manager").
		Where("user_id = ? AND team_id = ?", userID, idTeam).
		First(teamUser).Error; err != nil {
		return nil, errors.New("error while reloading team user")
	}

	return teamUserMapper.DBTeamUserToGraph(teamUser), nil
}

func (r *Repository) AddUsersToTeam(input model.AddUsersToTeamInput) ([]*model.TeamUser, error) {
	idTeam, ok := uuid.Parse(input.TeamID)
	if ok != nil {
		return nil, errors.New("error while parsing teamID")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where(whereIDs, idTeam).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundErrors
	}
	var addedUsers []*model.TeamUser
	for _, userIDStr := range input.UserIDs {
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return nil, errors.New("error while parsing a user id")
		}

		var existingUser *dbmodels.User
		if err := r.DB.Where(whereIDs, userID).First(&existingUser).Error; err != nil {
			return nil, errors.New("error: a user not found")
		}
		var existingTeamUser *dbmodels.TeamUser
		if err := r.DB.Where(&dbmodels.TeamUser{UserID: userID, TeamID: idTeam}).First(&existingTeamUser).Error; err == nil {
			continue
		}

		teamUser := &dbmodels.TeamUser{
			UserID: userID,
			TeamID: idTeam,
		}

		if err := r.DB.Create(teamUser).Error; err != nil {
			return nil, errors.New("error while adding a user to the team")
		}

		addedUsers = append(addedUsers, teamUserMapper.DBTeamUserToGraph(teamUser))
	}
	return addedUsers, nil
}

func (r *Repository) RemoveUserFromTeam(id string, teamID string) (bool, error) {
	userID, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where(whereIDs, userID).First(&existingUser).Error; err != nil {
		return false, errors.New("user not found")
	}
	idTeam, err := uuid.Parse(teamID)
	if err != nil {
		return false, teamIdParsingError
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where(whereIDs, idTeam).First(&existingTeam).Error; err != nil {
		return false, teamNotFoundErrors
	}
	var existingTeamUser *dbmodels.TeamUser
	if err := r.DB.Where(&dbmodels.TeamUser{UserID: userID, TeamID: idTeam}).First(&existingTeamUser).Error; err != nil {
		return false, errors.New("user not in team")
	}
	if err := r.DB.Delete(&existingTeamUser).Error; err != nil {
		return false, errors.New("error while removing user from team")
	}
	return true, nil
}
