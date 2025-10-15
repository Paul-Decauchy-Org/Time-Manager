package resolvers

import (
	"github.com/epitech/timemanager/services"
	"gorm.io/gorm"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

type Resolver struct{
	DB *gorm.DB
	AuthService *services.AuthService
	AdminService *services.AdminService
	TeamService *services.TeamService
}
