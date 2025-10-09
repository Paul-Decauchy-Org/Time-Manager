package repositories

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/mappers"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/database"
	"golang.org/x/crypto/bcrypt"
)

func SignUp(input model.SignUpInput) (*model.User, error) {
	db := database.DB
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	user := &models.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		Phone:     input.Phone,
		Password:  string(hashedPassword),
		Role:      models.RoleUser, 
	}
	if err := db.Create(user).Error; err != nil {
		return nil, err
	}
	return mappers.DBUserToGraph(user), nil
}

func Login(email, password string) (*model.User, error) {
	db := database.DB
	var user models.User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, err
	}
	return mappers.DBUserToGraph(&user), nil
}