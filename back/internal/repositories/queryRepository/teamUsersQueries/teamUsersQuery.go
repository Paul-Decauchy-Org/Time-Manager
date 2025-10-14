package teamUsersQuery

import (
	"errors"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	"github.com/google/uuid"
)

func ListUsersByTeam(teamID string) ([]*gmodel.UserWithAllData, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}

	teamUUID, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.New("invalid team ID format")
	}

	var dbUsers []models.User
	err = database.DB.Joins("JOIN team_users ON team_users.user_id = users.id").
		Where("team_users.team_id = ?", teamUUID).
		Preload("Teams").
		Preload("TimeTableEntries").
		Preload("TimeTables").
		Find(&dbUsers).Error

	if err != nil {
		return nil, err
	}

	var usersWithAllData []*gmodel.UserWithAllData
	for _, user := range dbUsers {
		usersWithAllData = append(usersWithAllData, &gmodel.UserWithAllData{
			ID:        user.ID.String(),
			Email:     user.Email,
			FirstName: user.FirstName,
			LastName:  user.LastName,
			Phone:     user.Phone,
			Role:      gmodel.Role(user.Role),
		})
	}

	return usersWithAllData, nil
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
		Preload("TeamUsers").
		Preload("Teams").
		Preload("TimeTableEntries").
		Preload("TimeTables").
		Find(&dbUsers).Error
	if err != nil {
		return nil, err
	}

	// Transformer les modèles de BDD en modèles GraphQL
	var usersWithAllData []*gmodel.UserWithAllData
	for _, dbUser := range dbUsers {
		// Mapper l'utilisateur
		userWithData := &gmodel.UserWithAllData{
			ID:        dbUser.ID.String(),
			FirstName: dbUser.FirstName,
			LastName:  dbUser.LastName,
			Email:     dbUser.Email,
			Phone:     dbUser.Phone,
			Password:  dbUser.Password,
			Role:      gmodel.Role(dbUser.Role),
		}

		// Mapper les équipes
		for _, team := range dbUser.Teams {
			userWithData.Teams = append(userWithData.Teams, &gmodel.Team{
				ID:          team.ID.String(),
				Name:        team.Name,
				Description: team.Description,
				ManagerID: &gmodel.User{
					ID: team.ManagerID.String(),
				},
			})
		}

		// Mapper les entrées de pointage
		for _, entry := range dbUser.TimeTableEntries {
			userWithData.TimeTableEntries = append(userWithData.TimeTableEntries, &gmodel.TimeTableEntry{
				ID: entry.ID.String(),
				UserID: &gmodel.User{
					ID: entry.UserID.String(),
				},
				Day:       entry.Day, // Supposant que c'est déjà au bon format ou qu'il y a une conversion
				Arrival:   entry.Arrival,
				Departure: &entry.Departure,
				Status:    entry.Status,
			})
		}

		// Mapper les horaires
		for _, tt := range dbUser.TimeTables {
			userWithData.TimeTables = append(userWithData.TimeTables, &gmodel.TimeTable{
				ID: tt.ID.String(),
				UserID: &gmodel.User{
					ID: tt.UserID.String(),
				},
				Day:   tt.Day,
				Start: tt.Start,
				End:   tt.End,
			})
		}

		usersWithAllData = append(usersWithAllData, userWithData)
	}

	return usersWithAllData, nil
}
