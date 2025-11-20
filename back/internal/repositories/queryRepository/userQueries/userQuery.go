package userQueries

import (
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	// "github.com/google/uuid"
)

var databaseInitializationError = errors.New("database not initialized")

const idNotInCondition = "id NOT IN (?)"

func ListUsers() ([]*gmodel.User, error) {
	// Defensive check to avoid panic when DB is not initialized
	if database.DB == nil {
		return nil, databaseInitializationError
	}
	db := database.DB
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}
	out := make([]*gmodel.User, 0, len(users))
	for i := range users {
		out = append(out, userMapper.DBUserToGraph(&users[i]))
	}
	return out, nil
}

func ListUsersWithAllData() ([]*gmodel.UserWithAllData, error) {
	if database.DB == nil {
		return nil, databaseInitializationError
	}
	var users []models.User
	if err := database.DB.Preload("Teams").Preload("TimeTableEntries").Preload("TimeTables").Find(&users).Error; err != nil {
		return nil, err
	}
	out := make([]*gmodel.UserWithAllData, 0, len(users))
	for i := range users {
		out = append(out, userMapper.DBUserToGraphWithAllData(&users[i]))
	}
	return out, nil
}

func GetUserByEmail(email string) (*gmodel.User, error) {
	if database.DB == nil {
		return nil, databaseInitializationError
	}
	var user models.User
	if err := database.DB.First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(&user), nil
}

func GetUsersByGroup(inGroup bool) ([]*gmodel.User, error) {
	if database.DB == nil {
		return nil, databaseInitializationError
	}
	var users []models.User
	subTeamUsers := database.DB.Table("team_users").Select("user_id")
	subManagers := database.DB.Table("teams").Select("manager_id")
	query := database.DB.Where("role <> ?", "ADMIN")

	if inGroup {
		query = query.Where("id IN (?)", subTeamUsers).Where(idNotInCondition, subManagers)
	} else {
		query = query.Where(idNotInCondition, subTeamUsers).Where(idNotInCondition, subManagers)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to query users by group: %w", err)
	}

	out := make([]*gmodel.User, 0, len(users))
	for i := range users {
		out = append(out, userMapper.DBUserToGraph(&users[i]))
	}
	return out, nil
}
