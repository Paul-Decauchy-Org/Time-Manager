package userMutations

import (
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	"github.com/epitech/timemanager/package/database"
	"golang.org/x/crypto/bcrypt"
	// "github.com/google/uuid"
)

func CreateUserInput(input gmodel.CreateUserInput) (*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}

	// Map graph input to DB model
	dbUser := userMapper.GraphCreateUserInputToDB(input)

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

	return userMapper.DBUserToGraph(dbUser), nil
}

func CreateMassiveUsers(input []gmodel.CreateUserInput) ([]*gmodel.User, error) {
	if database.DB == nil {
		return nil, errors.New("database not initialized")
	}
	createdUsers := make([]*gmodel.User, 0, len(input))
	for _, userInput := range input {
		user, err := CreateUserInput(userInput)
		if err != nil {
			return nil, fmt.Errorf("failed to create user %s: %w", userInput.Email, err)
		}
		createdUsers = append(createdUsers, user)
	}
	return createdUsers, nil
}
