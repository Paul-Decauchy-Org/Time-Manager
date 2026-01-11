package repositories

import (
	"errors"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	timeTableMapper "github.com/epitech/timemanager/internal/mappers/timeTable"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var idParsingError = errors.New("error while parsing id")
var userNotFoundError = errors.New("user not found")
var teamNotFoundError = errors.New("team not found")

const whereID = "id = ?"

func (r *Repository) CreateUser(input model.CreateUserInput) (*model.User, error) {
	var existingUser *dbmodels.User

	if err := r.DB.Where("email = ?", input.Email).First(&existingUser).Error; err == nil {
		return nil, errors.New("email already in use")
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("error while hashing password")
	}

	user := &dbmodels.User{
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Phone:     input.Phone,
		Email:     input.Email,
		Password:  string(hashedPassword),
		Role:      dbmodels.Role(input.Role),
	}
	if err := r.DB.Create(user).Error; err != nil {
		return nil, err
	}
	return userMapper.DBUserToGraph(user), nil
}

func (r *Repository) UpdateUser(id string, input model.UpdateUserInput) (*model.User, error) {
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, idParsingError
	}
	if err := r.DB.Where(whereID, uID).First(&existingUser).Error; err != nil {
		return nil, userNotFoundError
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

func (r *Repository) DeleteUser(id string) (bool, error) {
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return false, idParsingError
	}
	if err := r.DB.Where(whereID, uID).First(&existingUser).Error; err != nil {
		return false, userNotFoundError
	}
	if err := r.DB.Delete(&existingUser).Error; err != nil {
		return false, errors.New("failed to delete user")
	}
	return true, nil
}

func (r *Repository) GetUser(id string) (*model.UserWithAllData, error) {
	var existingUser dbmodels.User
	uID, ok := uuid.Parse(id)
	if ok != nil {
		return nil, idParsingError
	}
	if err := r.DB.Preload("TimeTableEntries").
		Where(whereID, uID).
		First(&existingUser).Error; err != nil {
		return nil, userNotFoundError
	}
	return userMapper.DBUserToGraphWithAllData(&existingUser), nil
}

func (r *Repository) SetManagerTeam(userID string, teamID string) (*model.Team, error) {
	id, ok := uuid.Parse(userID)
	if ok != nil {
		return nil, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User

	if err := r.DB.Where(whereID, id).First(&existingUser).Error; err != nil {
		return nil, userNotFoundError
	}
	idTeam, ok := uuid.Parse(teamID)
	if ok != nil {
		return nil, errors.New("error while parsing team id")
	}
	var existingTeam *dbmodels.Team
	if err := r.DB.Where(whereID, idTeam).First(&existingTeam).Error; err != nil {
		return nil, teamNotFoundError
	}
	if existingUser.Role != "MANAGER" {
		existingUser.Role = dbmodels.RoleManager
	}
	if err := r.DB.Save(&existingUser).Error; err != nil {
		return nil, errors.New("error while setting user role")
	}
	existingTeam.ManagerID = id
	if err := r.DB.Where(&existingTeam).Error; err != nil {
		return nil, errors.New("failed to update manager id for team")
	}
	return teamMapper.DBTeamToGraph(existingTeam), nil
}

func (r *Repository) SetRole(userID string, role model.Role) (*model.User, error) {
	id, ok := uuid.Parse(userID)
	if ok != nil {
		return nil, errors.New("error while parsing user id")
	}
	var existingUser *dbmodels.User

	if err := r.DB.Where(whereID, id).First(&existingUser).Error; err != nil {
		return nil, userNotFoundError
	}
	existingUser.Role = dbmodels.Role(role)
	if err := r.DB.Save(&existingUser).Error; err != nil {
		return nil, errors.New("error while setting user role")
	}
	return userMapper.DBUserToGraph(existingUser), nil
}

func (r *Repository) SetTimeTable(start string, end string) (*model.TimeTable, error) {
	layout := "15:04"

	startTime, err := time.Parse(layout, start)
	if err != nil {
		return nil, errors.New("invalid start time format, expected : HH:mm")
	}
	endTime, err := time.Parse(layout, end)
	if err != nil {
		return nil, errors.New("invalid start time format, excepted : HH:mm")
	}
	if err := r.DB.Model(&dbmodels.TimeTable{}).
		Where("is_active = ?", true).
		Updates(map[string]any{
			"is_active":    false,
			"effective_to": time.Now(),
		}).Error; err != nil {
		return nil, errors.New("failed to deactivate previous timetable")
	}
	newTimeTable := &dbmodels.TimeTable{
		Start:         startTime,
		Ends:          endTime,
		EffectiveFrom: time.Now(),
		IsActive:      true,
	}
	if err := r.DB.Create(newTimeTable).Error; err != nil {
		return nil, errors.New("failed to create new timetable")
	}

	return timeTableMapper.DBTimeTableToGraph(newTimeTable), nil
}
