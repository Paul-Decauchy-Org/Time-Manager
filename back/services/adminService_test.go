package services

import (
	"encoding/json"
	"errors"
	"testing"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockAdminRepo struct {
	mock.Mock
}

func (m *MockAdminRepo) CreateUser(input model.CreateUserInput) (*model.User, error) {
	args := m.Called(input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockAdminRepo) UpdateUser(id string, input model.UpdateUserInput) (*model.User, error) {
	args := m.Called(id, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockAdminRepo) DeleteUser(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}

func (m *MockAdminRepo) GetUser(id string) (*model.UserWithAllData, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.UserWithAllData), args.Error(1)
}

func (m *MockAdminRepo) SetManagerTeam(userID string, teamID string) (*model.Team, error) {
	args := m.Called(userID, teamID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Team), args.Error(1)
}

func (m *MockAdminRepo) SetRole(userID string, role model.Role) (*model.User, error) {
	args := m.Called(userID, role)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func TestAdminServiceDeleteUserAndGetUserAndSetRole(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	// Delete
	mockRepo.On("DeleteUser", "id-1").Return(true, nil).Once()
	ok, err := svc.DeleteUser("id-1")
	assert.NoError(t, err)
	assert.True(t, ok)

	// GetUser
	uw := &model.UserWithAllData{ID: "id-1", Email: "a@b"}
	mockRepo.On("GetUser", "id-1").Return(uw, nil).Once()
	got, err := svc.GetUser("id-1")
	assert.NoError(t, err)
	assert.Equal(t, uw, got)

	// SetRole
	u := &model.User{ID: "id-1", Role: model.RoleAdmin}
	mockRepo.On("SetRole", "id-1", model.Role(model.RoleAdmin)).Return(u, nil).Once()
	out, err := svc.SetRole("id-1", model.Role(model.RoleAdmin))
	assert.NoError(t, err)
	assert.Equal(t, u, out)

	mockRepo.AssertExpectations(t)
}

func TestAdminServiceCreateUserSuccess(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	input := model.CreateUserInput{
		Email:     "test@example.com",
		FirstName: "Test",
		LastName:  "User",
		Password:  "password123",
		Phone:     "1234567890",
		Role:      model.Role(model.RoleUser),
	}
	expected := &model.User{
		Email:     "test@example.com",
		FirstName: "Test",
		LastName:  "User",
		Password:  "password123",
		Phone:     "1234567890",
		Role:      model.Role(model.RoleUser),
	}

	// on accepte n'importe quel input struct ici (mock.Anything) ou préciser input si tu veux check exact
	mockRepo.On("CreateUser", mock.Anything).Return(expected, nil)

	got, err := svc.CreateUser(input)
	assert.NoError(t, err)
	assert.Equal(t, expected, got)

	mockRepo.AssertExpectations(t)
}

func ptrString(s string) *string {
	return &s
}

func TestAdminServiceCreateUserErrorDuplicate(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	input := model.CreateUserInput{
		Email:    "dup@example.com",
		Password: "p",
	}
	mockRepo.On("CreateUser", mock.Anything).Return(nil, errors.New("Email already in use"))

	got, err := svc.CreateUser(input)
	assert.Error(t, err)
	assert.Nil(t, got)
	t.Logf("Error creating user: %+v", err)

	mockRepo.AssertExpectations(t)
}

func TestAdminServiceCreateUserErrorInvalidInput(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	input := model.CreateUserInput{
		Email:    "invalid-email",
		Password: "short",
	}
	mockRepo.On("CreateUser", mock.Anything).Return(nil, errors.New("Invalid input"))

	got, err := svc.CreateUser(input)
	assert.Error(t, err)
	assert.Nil(t, got)
	t.Logf("Create user: %+v", got)

	mockRepo.AssertExpectations(t)
}

func TestAdminServiceUpdateUser(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	id := "some-uuid"
	input := model.UpdateUserInput{
		FirstName: ptrString("Updated"),
	}
	expected := &model.User{
		FirstName: "Updated",
		Email:     "old@example.com",
	}

	mockRepo.On("UpdateUser", id, mock.Anything).Return(expected, nil)

	got, err := svc.UpdateUser(id, input)
	assert.NoError(t, err)
	assert.Equal(t, expected, got)
	t.Logf("Updated user: %+v", got)

	mockRepo.AssertExpectations(t)
}

func TestAdminServiceSetManagerTeam(t *testing.T) {
	mockRepo := new(MockAdminRepo)
	svc := NewAdminService(mockRepo)

	userID := "user-uuid"
	teamID := "team-uuid"
	managerID := ptrString("manager-uuid")
	expected := &model.Team{
		ID:          teamID,
		Name:        "Test Team",
		Description: "Equipe de test",
		ManagerID:   &model.User{ID: *managerID},
		Users: []*model.UserWithAllData{
			{
				ID:        userID,
				Email:     "member1@mail.com",
				FirstName: "Member",
				LastName:  "one",
			},
			{
				ID:        "member2-uuid",
				Email:     "member2@mail.com",
				FirstName: "Member",
				LastName:  "two",
			},
		},
	}

	mockRepo.On("SetManagerTeam", userID, teamID).Return(expected, nil)

	got, err := svc.SetManagerTeam(userID, teamID)
	assert.NoError(t, err)
	assert.Equal(t, expected, got)
	if b, err := json.MarshalIndent(got, "", "  "); err != nil {
		t.Logf("Failed to marshal team: %v", err)
	} else {
		t.Logf("Set manager team: %s", string(b))
	}

	mockRepo.AssertExpectations(t)
}
