package repositories

import (
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/mappers"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	"golang.org/x/crypto/bcrypt"
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

func GetUserByEmail(email string) (*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	var user models.User
	if err := database.DB.First(&user, "email = ?", email).Error; err != nil {
		return nil, err
	}
	return mappers.DBUserToGraph(&user), nil
}

// ICI ce sont toutes les mutations des USERS

// CreateUserInput persists a new user (from GraphQL CreateUserInput) and returns the created GraphQL user
func CreateUserInput(input gmodel.CreateUserInput) (*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}

	// Map graph input to DB model
	dbUser := mappers.GraphCreateUserInputToDB(input)

	// Hash password before saving
	if dbUser.Password == "" {
		return nil, fmt.Errorf("password cannot be empty")
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(dbUser.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}
	dbUser.Password = string(hashed)

	// Save to DB
	if err := database.DB.Create(dbUser).Error; err != nil {
		return nil, err
	}

	return mappers.DBUserToGraph(dbUser), nil
}


