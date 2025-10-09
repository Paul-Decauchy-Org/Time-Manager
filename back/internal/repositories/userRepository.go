package repositories

import (
	"errors"

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
