package teamUsersQuery

import (
	"errors"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	"github.com/google/uuid"
)

func ListUsersByTeam(teamID string) ([]*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}

	teamUUID, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}

	var dbUsers []models.User
	err = database.DB.
		Joins("JOIN team_users ON team_users.user_id = users.id").
		Where("team_users.team_id = ?", teamUUID).
		Find(&dbUsers).Error

	if err != nil {
		return nil, err
	}

	users := make([]*gmodel.User, 0, len(dbUsers))
	for i := range dbUsers {
		users = append(users, userMapper.DBUserToGraph(&dbUsers[i]))
	}

	return users, nil
}

// ListUsersWithAllDataByTeam récupère les utilisateurs avec toutes leurs données pour une équipe
func ListUsersWithAllDataByTeam(teamID string) ([]*gmodel.UserWithAllData, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}

	// Convertir l'ID string en UUID
	teamUUID, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}

	// Récupérer les utilisateurs associés à l'équipe avec toutes leurs relations
	var dbUsers []models.User
	err = database.DB.
		Joins("JOIN team_users ON team_users.user_id = users.id").
		Where("team_users.team_id = ?", teamUUID).
		Preload("Teams").
		Preload("TimeTables").
		Find(&dbUsers).Error
	if err != nil {
		return nil, err
	}

	// Utiliser le mapper pour convertir
	usersWithAllData := make([]*gmodel.UserWithAllData, 0, len(dbUsers))
	for i := range dbUsers {
		usersWithAllData = append(usersWithAllData, userMapper.DBUserToGraphWithAllData(&dbUsers[i]))
	}

	return usersWithAllData, nil
}
