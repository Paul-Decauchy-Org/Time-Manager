package userMutations

import (
	"errors"
	"fmt"

	gmodel "github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
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
func CreateThreeUsers() ([]*gmodel.User, error) {
	emails := []string{"user@test.fr", "manager@test.fr", "admin@test.fr"}
	var count int64
	if err := database.DB.Model(&models.User{}).Where("email IN ?", emails).Count(&count).Error; err != nil {
		return nil, errors.New("error while checking existing users")
	}
	if count > 0 {
		return nil, errors.New("one or more users already exist")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("error while hashing password")
	}
	users := []*models.User{
		{
			FirstName: "Basic",
			LastName:  "User",
			Email:     "user@test.fr",
			Phone: "01010101",
			Password:  string(hashedPassword),
			Role:      models.RoleUser,
		},
		{
			FirstName: "Manager",
			LastName:  "User",
			Phone: "02020202",
			Email:     "manager@test.fr",
			Password:  string(hashedPassword),
			Role:      models.RoleManager,
		},
		{
			FirstName: "Admin",
			LastName:  "User",
			Phone: "03030303",
			Email:     "admin@test.fr",
			Password:  string(hashedPassword),
			Role:      models.RoleAdmin,
		},
	}
	if err := database.DB.Create(&users).Error; err != nil {
		return nil, errors.New("error while creating users")
	}
	var gUsers []*gmodel.User
	for _, u := range users {
		gUsers = append(gUsers, userMapper.DBUserToGraph(u))
	}
	return gUsers, nil
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
