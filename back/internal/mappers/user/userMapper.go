package userMapper

// This file contains functions to map between database models and GraphQL models.

import (
	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	timeTableEntriesMapper "github.com/epitech/timemanager/internal/mappers/timeTableEntries"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBUserToGraph(u *gmodel.User) *model.User {
	if u == nil {
		return nil
	}
	return &model.User{
		ID:        u.ID.String(),
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Phone:     u.Phone,
		// Do not expose hashed password in GraphQL responses
		Password: "",
		Role:     model.Role(u.Role),
	}
}

func DBUserToSignedGraph(u *gmodel.User, hasStartedDay bool, startedAt *string) *model.SignedUser {
	if u == nil {
		return nil
	}

	return &model.SignedUser{
		ID:            u.ID.String(),
		FirstName:     u.FirstName,
		LastName:      u.LastName,
		Email:         u.Email,
		Password:      "",
		Role:          model.Role(u.Role),
		HasStartedDay: hasStartedDay,
		StartedAt:     startedAt,
	}
}


func DBUserToGraphWithAllData(u *gmodel.User) *model.UserWithAllData {
	if u == nil {
		return nil
	}
	// Convert []dbmodels.TimeTableEntry to []*dbmodels.TimeTableEntry
	timeTableEntries := make([]*gmodel.TimeTableEntry, len(u.TimeTableEntries))
	for i := range u.TimeTableEntries {
		timeTableEntries[i] = &u.TimeTableEntries[i]
	}


	// Extract []*dbmodels.Team from []dbmodels.TeamUser
	teams := make([]*gmodel.Team, len(u.Teams))
	copy(teams, u.Teams)

	return &model.UserWithAllData{
		ID:        u.ID.String(),
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Phone:     u.Phone,
		// Do not expose hashed password in GraphQL responses
		Password:         "",
		Role:             model.Role(u.Role),
		Teams:            teamMapper.DBTeamsToGraph(teams),
		TimeTableEntries: timeTableEntriesMapper.DBTimeTableEntriesToGraph(timeTableEntries),
	}
}

func GraphCreateUserInputToDB(in model.CreateUserInput) *gmodel.User {
	return &gmodel.User{
		FirstName: in.FirstName,
		LastName:  in.LastName,
		Email:     in.Email,
		Phone:     in.Phone,
		Password:  in.Password,
		Role:      gmodel.Role(in.Role),
	}
}
