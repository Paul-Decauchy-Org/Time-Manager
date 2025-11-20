package repositories

import (
	"errors"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	models "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const emailCondition = "email = ?"

func (r *Repository) SignUp(input model.SignUpInput) (*model.User, error) {
	var existingUser models.User
	if err := r.DB.Where(emailCondition, input.Email).First(&existingUser).Error; err == nil {
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
	if err := r.DB.Where(emailCondition, email).First(&user).Error; err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(&user), nil
}

func (r *Repository) Me(email string) (*model.SignedUser, error) {
	var user models.User
	if err := r.DB.Where(emailCondition, email).First(&user).Error; err != nil {
		return nil, err
	}
	today := time.Now().Format("2006-01-02")
	var entry models.TimeTableEntry

	err := r.DB.
		Where("user_id = ? AND DATE(day) = ?", user.ID, today).
		Order("day DESC").
		First(&entry).Error

	hasStartedDay := false
	var startedAt *string = nil

	if err == nil && entry.ID != uuid.Nil && entry.Status {
		hasStartedDay = true
		formatted := entry.Arrival.Format("15:04")
		startedAt = &formatted
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	return userMapper.DBUserToSignedGraph(&user, hasStartedDay, startedAt), nil
}

func (r *Repository) UpdateProfile(email string, input model.UpdateProfileInput) (*model.User, error) {
	var user models.User
	if err := r.DB.Where(emailCondition, email).First(&user).Error; err != nil {
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
	if err := r.DB.Where(emailCondition, email).First(&user).Error; err != nil {
		return false, errors.New("user not found")
	}
	if err := r.DB.Delete(&user).Error; err != nil {
		return false, errors.New("failed to delete user")
	}
	return true, nil
}
