package repositories

import (
	"github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
	"golang.org/x/crypto/bcrypt"
)





func (r *Repository) SignUp(input model.SignUpInput) (*model.User, error) {
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
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(user), nil
}

func (r *Repository) Login(email, password string) (*model.User, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(&user), nil
}
