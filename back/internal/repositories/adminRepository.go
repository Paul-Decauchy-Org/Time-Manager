package repositories

import (
	"errors"

	"github.com/epitech/timemanager/internal/graph/model"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

func (r *Repository) CreateUser(input model.CreateUserInput)(*model.User, error){
	var existingUser *dbmodels.User

	if err := r.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("email already in use")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password),bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("error while hashing password")
	}

	user := &dbmodels.User{
		FirstName: input.FirstName,
		LastName: input.LastName,
		Phone: input.Phone,
		Email: input.Email,
		Password: string(hashedPassword),
		Role: dbmodels.Role(input.Role),
	}
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(user), nil
}

func (r *Repository) UpdateUser(id string, input model.UpdateUserInput)(*model.User, error){
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing id")
	}
	if err := r.DB.Where("id = ?", uID).First(&existingUser).Error; err != nil {
		return nil, errors.New("user not found")
	}
	if input.FirstName != nil {
		existingUser.FirstName = *input.FirstName
	}
	if input.LastName != nil {
		existingUser.LastName = *input.LastName
	}
	if input.Email != nil {
		existingUser.Email = *input.Email
	}
	if input.Password != nil {
		hashed, err := bcrypt.GenerateFromPassword([]byte(*input.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("failed to hash password")
		}
		existingUser.Password = string(hashed)
	}
	if input.Role != nil {
		existingUser.Role = dbmodels.Role(*input.Role)
	}
	if input.Phone != nil {
		existingUser.Phone = *input.Phone
	}

	if err := r.DB.Save(&existingUser).Error; err != nil {
		return nil, errors.New("failed to update user")
	}
	return userMapper.DBUserToGraph(&existingUser), nil
}

func (r *Repository) DeleteUser(id string)(bool, error){
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return false, errors.New("error while parsing id")
	}
	if err := r.DB.Where("id = ?",uID).First(&existingUser).Error; err != nil {
		return false, errors.New("user not found")
	}
	if err := r.DB.Delete(&existingUser).Error; err != nil {
		return false, errors.New("failed to delete user")
	}
	return true, nil
}

func (r *Repository) GetUser(id string)(*model.UserWithAllData, error){
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, errors.New("error while parsing id")
	}
	if err := r.DB.Preload("TimeTableEntries").
		Preload("TimeTables").
		Preload("TeamUsers.Team").
		Where("id = ?", uID).
		First(&existingUser).Error; err != nil {
		return nil, errors.New("user not found")
	}
	return userMapper.DBUserToGraphWithAllData(&existingUser), nil
}