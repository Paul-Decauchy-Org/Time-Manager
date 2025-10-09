package mappers

// This file contains functions to map between database models and GraphQL models.

import (
	"github.com/epitech/timemanager/internal/graph/model"
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
		Password:  u.Password,
		Role:      model.Role(u.Role),
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
