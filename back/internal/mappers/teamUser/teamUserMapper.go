package TeamUserMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBTeamUserToGraph(t *gmodel.TeamUser) *model.TeamUser {
	if t == nil {
		return nil
	}
	return &model.TeamUser{
		ID:     t.ID.String(),
		UserID: &model.User{ID: t.User.ID.String()},
		TeamID: &model.Team{ID: t.Team.ID.String()},
	}
}
