package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func (r *Repository) CreateUser(input model.CreateUserInput)(*model.User, error){
	var existingUser *dbmodels.User

	if err := r.DB.Where("email = ?", input.Email).First(&existingUser).Error; err != nil {
		return nil, errors.New("email already in use")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password),bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("error while hashing password")
	}

	user := &dbmodels.User{
		FirstName: input.FirstName,
		LastName: input.LastName,
		Email: input.Email,
		Password: string(hashedPassword),
		Role: dbmodels.Role(input.Role),
	}
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(user), nil
}