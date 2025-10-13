package teamMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBTeamToGraph(t *gmodel.Team) *model.Team {
	if t == nil {
		return nil
	}
	var manager *model.User
	if t.Manager != nil {
		manager = &model.User{ID: t.Manager.ID.String()}
	}
	return &model.Team{
		ID:          t.ID.String(),
		Name:        t.Name,
		Description: t.Description,
		ManagerID:   manager,
	}
}

func DBTeamsToGraph(teams []*gmodel.Team) []*model.Team {
	out := make([]*model.Team, 0, len(teams))
	for i := range teams {
		out = append(out, DBTeamToGraph(teams[i]))
	}
	return out
}
