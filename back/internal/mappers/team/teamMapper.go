package teamMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
)

func DBTeamToGraph(t *gmodel.Team) *model.Team {
	if t == nil {
		return nil
	}
	team := &model.Team{
		ID:          t.ID.String(),
		Name:        t.Name,
		Description: t.Description,
	}
	if t.Manager != nil {
		team.ManagerID = &model.User{
			ID:        t.Manager.ID.String(),
			FirstName: t.Manager.FirstName,
			LastName:  t.Manager.LastName,
			Email:     t.Manager.Email,
			Phone:     t.Manager.Phone,
			Password:  t.Manager.Password,
			Role:      model.Role(t.Manager.Role),
		}
	} else if t.ManagerID != uuid.Nil {
		team.ManagerID = &model.User{
			ID: t.ManagerID.String(),
		}
	}

	return team
}

func DBTeamsToGraph(teams []*gmodel.Team) []*model.Team {
	out := make([]*model.Team, 0, len(teams))
	for i := range teams {
		out = append(out, DBTeamToGraph(teams[i]))
	}
	return out
}

func GraphCreateTeamInputToDB(input model.CreateTeamInput) *gmodel.Team {
	managerUUID, err := uuid.Parse(input.ManagerID)
	if err != nil {
		return nil
	}
	return &gmodel.Team{
		Name:        input.Name,
		Description: input.Description,
		ManagerID:   managerUUID,
	}
}

func GraphUpdateTeamInputToDB(input model.UpdateTeamInput) *gmodel.Team {
	team := &gmodel.Team{}
	if input.Name != nil {
		team.Name = *input.Name
	}
	if input.Description != nil {
		team.Description = *input.Description
	}
	if input.ManagerID != nil {
		managerUUID, err := uuid.Parse(*input.ManagerID)
		if err == nil {
			team.ManagerID = managerUUID
		}
	}
	return team
}
