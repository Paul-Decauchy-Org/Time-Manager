package teamMutations

import (
	// "context"
	// "time"
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	teamUserMapper "github.com/epitech/timemanager/internal/mappers/teamUser"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	"github.com/google/uuid"
)

func CreateTeam(input gmodel.CreateTeamInput) (*gmodel.Team, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB

	// Utiliser une transaction pour garantir la cohérence
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	managerID, err := uuid.Parse(input.ManagerID)
	if err != nil {
		return nil, errors.New("invalid manager ID format")
	}

	var manager dbmodels.User
	if err := tx.First(&manager, managerID).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("manager not found")
	}

	if manager.Role != dbmodels.Role(gmodel.RoleAdmin) {
		manager.Role = dbmodels.Role(gmodel.RoleManager)
		if err := tx.Save(&manager).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("failed to update manager role: " + err.Error())
		}
	}
	dbTeam := teamMapper.GraphCreateTeamInputToDB(input)
	if dbTeam == nil {
		tx.Rollback()
		return nil, errors.New("invalid team input")
	}

	if err := tx.Create(dbTeam).Error; err != nil {
		tx.Rollback()
		return nil, err
	}
	// Valider la transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	var createdTeam dbmodels.Team
	if err := db.Preload("Manager").First(&createdTeam, dbTeam.ID).Error; err != nil {
		return nil, err
	}

	return teamMapper.DBTeamToGraph(&createdTeam), nil
}

func UpdateTeam(id string, input gmodel.UpdateTeamInput) (*gmodel.Team, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB

	// Utiliser une transaction pour garantir la cohérence
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	teamID, err := uuid.Parse(id)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}
	var team dbmodels.Team
	if err := tx.Where("id = ?", teamID).First(&team).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("team not found: " + err.Error())
	}

	if input.Name != nil {
		team.Name = *input.Name
	}
	if input.Description != nil {
		team.Description = *input.Description
	}
	if input.ManagerID != nil {
		managerUUID, err := uuid.Parse(*input.ManagerID)
		if err != nil {
			tx.Rollback()
			return nil, errors.New("invalid manager ID format")
		}

		var newManager dbmodels.User
		if err := tx.First(&newManager, managerUUID).Error; err != nil {
			tx.Rollback()
			return nil, errors.New("new manager not found")
		}

		if newManager.Role != dbmodels.Role(gmodel.RoleAdmin) &&
			newManager.Role != dbmodels.Role(gmodel.RoleManager) {
			newManager.Role = dbmodels.Role(gmodel.RoleManager)
			if err := tx.Save(&newManager).Error; err != nil {
				tx.Rollback()
				return nil, errors.New("failed to update new manager role: " + err.Error())
			}
		}

		team.ManagerID = managerUUID
	}

	if err := tx.Save(&team).Error; err != nil {
		tx.Rollback()
		return nil, errors.New("failed to update team: " + err.Error())
	}
	// Valider la transaction
	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	var updatedTeam dbmodels.Team
	if err := db.Preload("Manager").Where("id = ?", teamID).First(&updatedTeam).Error; err != nil {
		return nil, err
	}

	return teamMapper.DBTeamToGraph(&updatedTeam), nil
}

func DeleteTeam(id string) (bool, error) {
	if database.DB == nil {
		return false, errors.New("database not initialized")
	}
	db := database.DB

	teamID, err := uuid.Parse(id)
	if err != nil {
		return false, errors.New("invalid team ID format")
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var team dbmodels.Team
	if err := tx.Where("id = ?", teamID).First(&team).Error; err != nil {
		tx.Rollback()
		return false, errors.New("team not found: " + err.Error())
	}

	if err := tx.Where("team_id = ?", teamID).Delete(&dbmodels.TeamUser{}).Error; err != nil {
		tx.Rollback()
		return false, errors.New("failed to delete team user relationships: " + err.Error())
	}

	if err := tx.Delete(&team).Error; err != nil {
		tx.Rollback()
		return false, errors.New("failed to delete team: " + err.Error())
	}

	if err := tx.Commit().Error; err != nil {
		return false, err
	}

	return true, nil
}

func AddUserToTeam(userID string, teamID string) (*gmodel.TeamUser, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID format")
	}

	teamUUID, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}

	var user dbmodels.User
	if err := db.Where("id = ?", userUUID).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}

	var team dbmodels.Team
	if err := db.Where("id = ?", teamUUID).First(&team).Error; err != nil {
		return nil, errors.New("team not found")
	}

	var existingTeamUser dbmodels.TeamUser
	result := db.Where("user_id = ? AND team_id = ?", userUUID, teamUUID).First(&existingTeamUser)
	if result.Error == nil {
		return nil, errors.New("user is already in this team")
	}

	teamUser := dbmodels.TeamUser{
		ID:     uuid.New(),
		UserID: userUUID,
		TeamID: teamUUID,
	}

	if err := db.Create(&teamUser).Error; err != nil {
		return nil, errors.New("failed to add user to team: " + err.Error())
	}

	if err := db.Preload("User").Preload("Team").Where("id = ?", teamUser.ID).First(&teamUser).Error; err != nil {
		return nil, errors.New("failed to load team user data: " + err.Error())
	}

	return teamUserMapper.DBTeamUserToGraph(&teamUser), nil
}

func AddUsersToTeam(input gmodel.AddUsersToTeamInput) ([]*gmodel.TeamUser, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB

	teamUUID, err := uuid.Parse(input.TeamID)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}

	var team dbmodels.Team
	if err := db.Where("id = ?", teamUUID).First(&team).Error; err != nil {
		return nil, errors.New("team not found")
	}

	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	results := make([]*gmodel.TeamUser, 0, len(input.UserIDs))
	failedUsers := make([]string, 0)

	for _, userIDStr := range input.UserIDs {
		userUUID, err := uuid.Parse(userIDStr)
		if err != nil {
			failedUsers = append(failedUsers, fmt.Sprintf("%s (invalid ID format)", userIDStr))
			continue
		}

		var user dbmodels.User
		if err := tx.Where("id = ?", userUUID).First(&user).Error; err != nil {
			failedUsers = append(failedUsers, fmt.Sprintf("%s (user not found)", userIDStr))
			continue
		}

		var existingTeamUser dbmodels.TeamUser
		result := tx.Where("user_id = ? AND team_id = ?", userUUID, teamUUID).First(&existingTeamUser)
		if result.Error == nil {
			failedUsers = append(failedUsers, fmt.Sprintf("%s (already in team)", userIDStr))
			continue
		}

		teamUser := dbmodels.TeamUser{
			ID:     uuid.New(),
			UserID: userUUID,
			TeamID: teamUUID,
		}

		if err := tx.Create(&teamUser).Error; err != nil {
			failedUsers = append(failedUsers, fmt.Sprintf("%s (db error)", userIDStr))
			continue
		}

		if err := tx.Preload("User").Preload("Team").First(&teamUser, teamUser.ID).Error; err != nil {
			failedUsers = append(failedUsers, fmt.Sprintf("%s (load error)", userIDStr))
			continue
		}

		results = append(results, teamUserMapper.DBTeamUserToGraph(&teamUser))
	}

	if len(results) == 0 {
		tx.Rollback()
		return nil, errors.New("failed to add users: " + fmt.Sprintf("%v", failedUsers))
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	if len(failedUsers) > 0 {
		fmt.Printf("Warning: Some users could not be added to team: %v\n", failedUsers)
	}

	return results, nil
}

func RemoveUserFromTeam(userID string, teamID string) (bool, error) {
    if database.DB == nil {
        return false, errors.New("database not initialized")
    }
    db := database.DB
    
    userUUID, err := uuid.Parse(userID)
    if err != nil {
        return false, errors.New("invalid user ID format")
    }
    
    teamUUID, err := uuid.Parse(teamID)
    if err != nil {
        return false, errors.New("invalid team ID format")
    }
    
    result := db.Where("user_id = ? AND team_id = ?", userUUID, teamUUID).Delete(&dbmodels.TeamUser{})
    if result.Error != nil {
        return false, errors.New("failed to remove user from team: " + result.Error.Error())
    }
    
    if result.RowsAffected == 0 {
        return false, errors.New("user is not in this team")
    }
    
    return true, nil
}