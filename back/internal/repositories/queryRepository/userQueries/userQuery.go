package userQueries

import (
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/mappers"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	// "github.com/google/uuid"
)


func ListUsers() ([]*gmodel.User, error) {
	// Defensive check to avoid panic when DB is not initialized
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}
	out := make([]*gmodel.User, 0, len(users))
	for i := range users {
		out = append(out, mappers.DBUserToGraph(&users[i]))
	}
	return out, nil
}

func GetUserByEmail(email string) (*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	var user models.User
	if err := database.DB.First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return mappers.DBUserToGraph(&user), nil
}

func GetUsersByGroup(inGroup bool) ([]*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	var users []models.User

	//récuperer les users presents team_users
	sub := database.DB.Table("team_users").Select("user_id")
	query := database.DB.Where("role <> ?", "ADMIN")
	if inGroup {
		query = query.Where("id IN (?)", sub)
	} else {
		query = query.Where("id NOT IN (?)", sub)
	}

	if err := query.Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to query users by group: %w", err)
	}

	out := make([]*gmodel.User, 0, len(users))
	for i := range users {
		out = append(out, mappers.DBUserToGraph(&users[i]))
	}
	return out, nil
}
