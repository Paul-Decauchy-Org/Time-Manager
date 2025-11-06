package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
	"golang.org/x/crypto/bcrypt"
)

func (r *Repository) SignUp(input model.SignUpInput) (*model.User, error) {
	var existingUser models.User
	if err := r.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("email already in use")
	}

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

func (r *Repository) Me(email string) (*model.User, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(&user), nil
}

func (r *Repository) UpdateProfile(email string, input model.UpdateProfileInput) (*model.User, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("user not found")
	}
	if input.FirstName != nil {
		user.FirstName = *input.FirstName
	}
	if input.LastName != nil {
		user.LastName = *input.LastName
	}
	if input.Email != nil {
		user.Email = *input.Email
	}
	if input.Password != nil {
		hashed, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("failed to hash password")
		}
		user.Password = string(hashed)
	}
	if input.Phone != nil {
		user.Phone = *input.Phone
	}
	if err := r.DB.Save(&user).Error; err != nil {
		return nil, errors.New("failed to update user profile")
	}
	return userMapper.DBUserToGraph(&user), nil
}

func (r *Repository) DeleteProfile(email string) (bool, error) {
	var user models.User
	if err := r.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return false, errors.New("user not found")
	}
	if err := r.DB.Delete(&user).Error; err != nil {
		return false, errors.New("failed to delete user")
	}
	return true, nil
}
