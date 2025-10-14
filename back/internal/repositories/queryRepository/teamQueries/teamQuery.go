package teamQueries

import (
	"errors"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
)

func ListTeams() ([]*gmodel.Team, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	db := database.DB
	var teams []models.Team

	if err := db.Preload("Manager").Find(&teams).Error; err != nil {
		return nil, err
	}

	out := make([]*gmodel.Team, 0, len(teams))
	for i := range teams {
		out = append(out, teamMapper.DBTeamToGraph(&teams[i]))
	}
	return out, nil
}
