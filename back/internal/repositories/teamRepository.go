package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	teamUserMapper "github.com/epitech/timemanager/internal/mappers/teamUser"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
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

func (r *Repository) UpdateTeam(managerID string, idTeam string, input model.UpdateTeamInput)(*model.Team, error){
	teamID, ok := uuid.Parse(idTeam)
	if ok != nil {
		return nil, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", teamID).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	idUser, ok := uuid.Parse(managerID)
	if ok != nil {
		return nil, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where("id = ?", idUser).First(&existingUser).Error; err != nil {
		return nil, errors.New("user not found")
	}
	if existingTeam.ManagerID != existingUser.ID && existingUser.Role != dbmodels.RoleAdmin {
		return nil, errors.New("user has not access to this team")
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

func (r *Repository) DeleteTeam(managerID string, id string)(bool, error){
	teamID, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", teamID).First(&existingTeam).Error; err != nil {
		return false, errors.New("team not found")
	}
	idUser, ok := uuid.Parse(managerID)
	if ok != nil {
		return false, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where("id = ?", idUser).First(&existingUser).Error; err != nil {
		return false, errors.New("user not found")
	}
	if existingTeam.ManagerID != existingUser.ID && existingUser.Role != dbmodels.RoleAdmin {
		return false, errors.New("user has not access to this team")
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


func (r *Repository) AddUserToTeam(managerID string, id string, teamID string)(*model.TeamUser, error){
	userID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing userID")
	}
	idTeam, ok := uuid.Parse(teamID)
	if ok != nil {
		return nil, errors.New("error while parsing teamID")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		return nil, errors.New("user not found")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", idTeam).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	var existingTeamUser *dbmodels.TeamUser
	if err := r.DB.Where(&dbmodels.TeamUser{UserID: userID, TeamID: idTeam}).First(&existingTeamUser).Error; err == nil {
		return nil, errors.New("user is already in the team")
	}
	idUser, ok := uuid.Parse(managerID)
	if ok != nil {
		return nil, errors.New("error while parsing user id")
	}
	var existingManager *dbmodels.User
	if err := r.DB.Where("id = ?", idUser).First(&existingManager).Error; err != nil {
		return nil, errors.New("manager id not found")
	}
	if existingTeam.ManagerID != existingManager.ID && existingManager.Role != dbmodels.RoleAdmin {
		return nil, errors.New("user has not access to this team")
	}
	teamUser := &dbmodels.TeamUser{
		UserID: userID,
		TeamID: idTeam,
	}
	if err := r.DB.Create(teamUser).Error; err != nil {
		return nil, errors.New("error while adding user to the team")
	}
	return teamUserMapper.DBTeamUserToGraph(teamUser), nil
}

func (r *Repository) AddUsersToTeam(managerID string, input model.AddUsersToTeamInput)([]*model.TeamUser, error){
	idTeam, ok := uuid.Parse(input.TeamID)
	if ok != nil {
		return nil, errors.New("error while parsing teamID")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", idTeam).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	idUser, ok := uuid.Parse(managerID)
	if ok != nil {
		return nil, errors.New("error while parsing user id")
	}
	var existingManager *dbmodels.User
	if err := r.DB.Where("id = ?", idUser).First(&existingManager).Error; err != nil {
		return nil, errors.New("manager id not found")
	}
	if existingTeam.ManagerID != existingManager.ID && existingManager.Role != dbmodels.RoleAdmin {
		return nil, errors.New("user has not access to this team")
	}
	var addedUsers []*model.TeamUser
	for _, userIDStr := range input.UserIDs {
		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return nil, errors.New("error while parsing a user id")
		}

		var existingUser *dbmodels.User
		if err := r.DB.Where("id = ?", userID).First(&existingUser).Error; err != nil {
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

func (r *Repository) RemoveUserFromTeam(managerID string, id string, teamID string)(bool, error){
	userID, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User
	if err := r.DB.Where("id = ?", userID).First(&existingUser).Error; err != nil {
		return false, errors.New("user not found")
	}
	idTeam, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", idTeam).First(&existingTeam).Error; err != nil {
		return false, errors.New("team not found")
	}
	var existingTeamUser *dbmodels.TeamUser
	if err := r.DB.Where(&dbmodels.TeamUser{UserID: userID, TeamID: idTeam}).First(&existingTeamUser).Error; err != nil {
		return false, errors.New("user not in team")
	}
	idUser, ok := uuid.Parse(managerID)
	if ok != nil {
		return false, errors.New("error while parsing user id")
	}
	var existingManager *dbmodels.User
	if err := r.DB.Where("id = ?", idUser).First(&existingManager).Error; err != nil {
		return false, errors.New("manager id not found")
	}
	if existingTeam.ManagerID != existingManager.ID && existingManager.Role != dbmodels.RoleAdmin {
		return false, errors.New("user has not access to this team")
	}
	if err := r.DB.Delete(&existingTeamUser).Error; err != nil {
		return false, errors.New("error while removing user from team")
	}
	return true, nil
}

func (r *Repository) GetUsersInTeam(teamID string)([]*model.User, error){
	idTeam, ok := uuid.Parse(teamID)
	if ok != nil {
		return nil, errors.New("error while parsing teamID")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where("id = ?", idTeam).First(&existingTeam).Error; err != nil {
		return nil, errors.New("team not found")
	}
	var users *[]dbmodels.User
	if err := r.DB.
		Joins("JOIN team_users ON team_users.user_id = users.id").
		Where("team_users.team_id = ?", idTeam).
		Find(&users).Error; err != nil {
		return nil, errors.New("error while fetching users in team")
	}
	if len(*users) == 0 {
		return []*model.User{}, nil
	}
	result := make([]*model.User, len(*users))
	for i, u := range *users {
		result[i] = userMapper.DBUserToGraph(&u)
	}
	return result, nil
}