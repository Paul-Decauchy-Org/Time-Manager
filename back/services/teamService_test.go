package services

import (
	"errors"
	"testing"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockTeamRepo struct{ mock.Mock }

func (m *MockTeamRepo) GetTeamUsers() []*model.TeamUser {
	args := m.Called()
	if args.Get(0) == nil {
		return nil
	}
	return args.Get(0).([]*model.TeamUser)
}
func (m *MockTeamRepo) CreateTeam(input model.CreateTeamInput) (*model.Team, error) {
	args := m.Called(input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Team), args.Error(1)
}
func (m *MockTeamRepo) UpdateTeam(id string, input model.UpdateTeamInput) (*model.Team, error) {
	args := m.Called(id, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Team), args.Error(1)
}
func (m *MockTeamRepo) DeleteTeam(id string) (bool, error) {
	args := m.Called(id)
	return args.Bool(0), args.Error(1)
}
func (m *MockTeamRepo) GetTeam(id string) (*model.Team, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.Team), args.Error(1)
}
func (m *MockTeamRepo) GetTeams() ([]*model.Team, error) {
	args := m.Called()
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.Team), args.Error(1)
}
func (m *MockTeamRepo) AddUsersToTeam(input model.AddUsersToTeamInput) ([]*model.TeamUser, error) {
	args := m.Called(input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]*model.TeamUser), args.Error(1)
}
func (m *MockTeamRepo) RemoveUserFromTeam(userID string, teamID string) (bool, error) {
	args := m.Called(userID, teamID)
	return args.Bool(0), args.Error(1)
}
func (m *MockTeamRepo) AddUserToTeam(userID string, teamID string) (*model.TeamUser, error) {
	args := m.Called(userID, teamID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.TeamUser), args.Error(1)
}

func TestTeamServiceGetTeamUsers(t *testing.T) {
	repo := new(MockTeamRepo)
	svc := NewTeamService(repo)
	expected := []*model.TeamUser{{UserID: &model.User{ID: "u1"}, TeamID: &model.Team{ID: "t1"}}}
	repo.On("GetTeamUsers").Return(expected)
	got := svc.GetTeamUsers()
	assert.Equal(t, expected, got)
	repo.AssertExpectations(t)
}

func TestTeamServiceCreateUpdateDeleteGetGetAll(t *testing.T) {
	repo := new(MockTeamRepo)
	svc := NewTeamService(repo)

	// Create
	in := model.CreateTeamInput{Name: "A", Description: "desc", ManagerID: "m1"}
	created := &model.Team{ID: "t1", Name: "A"}
	repo.On("CreateTeam", in).Return(created, nil).Once()
	got, err := svc.CreateTeam(in)
	assert.NoError(t, err)
	assert.Equal(t, created, got)

	// Update
	newName := "B"
	upIn := model.UpdateTeamInput{Name: &newName}
	updated := &model.Team{ID: "t1", Name: "B"}
	repo.On("UpdateTeam", "t1", upIn).Return(updated, nil).Once()
	gotUp, err := svc.UpdateTeam("t1", upIn)
	assert.NoError(t, err)
	assert.Equal(t, updated, gotUp)

	// Get
	repo.On("GetTeam", "t1").Return(updated, nil).Once()
	gotOne, err := svc.GetTeam("t1")
	assert.NoError(t, err)
	assert.Equal(t, updated, gotOne)

	// GetAll
	repo.On("GetTeams").Return([]*model.Team{updated}, nil).Once()
	gotAll, err := svc.GetTeams()
	assert.NoError(t, err)
	assert.Len(t, gotAll, 1)

	// Delete
	repo.On("DeleteTeam", "t1").Return(true, nil).Once()
	ok, err := svc.DeleteTeam("t1")
	assert.NoError(t, err)
	assert.True(t, ok)

	repo.AssertExpectations(t)
}

func TestTeamServiceAddAndRemoveUsers(t *testing.T) {
	repo := new(MockTeamRepo)
	svc := NewTeamService(repo)

	// Add single
	tu := &model.TeamUser{UserID: &model.User{ID: "u1"}, TeamID: &model.Team{ID: "t1"}}
	repo.On("AddUserToTeam", "u1", "t1").Return(tu, nil).Once()
	got, err := svc.AddUserToTeam("u1", "t1")
	assert.NoError(t, err)
	assert.Equal(t, tu, got)

	// Add multiple
	in := model.AddUsersToTeamInput{UserIDs: []string{"u1", "u2"}, TeamID: "t1"}
	tus := []*model.TeamUser{tu}
	repo.On("AddUsersToTeam", in).Return(tus, nil).Once()
	gotMany, err := svc.AddUsersToTeam(in)
	assert.NoError(t, err)
	assert.Equal(t, tus, gotMany)

	// Remove
	repo.On("RemoveUserFromTeam", "u1", "t1").Return(true, nil).Once()
	ok, err := svc.RemoveUserFromTeam("u1", "t1")
	assert.NoError(t, err)
	assert.True(t, ok)

	repo.AssertExpectations(t)
}

func TestTeamServiceErrorPaths(t *testing.T) {
	repo := new(MockTeamRepo)
	svc := NewTeamService(repo)

	repo.On("CreateTeam", mock.Anything).Return(nil, errors.New("boom")).Once()
	got, err := svc.CreateTeam(model.CreateTeamInput{Name: "A", Description: "d", ManagerID: "m"})
	assert.Error(t, err)
	assert.Nil(t, got)

	repo.On("DeleteTeam", "bad").Return(false, errors.New("nope")).Once()
	ok, err := svc.DeleteTeam("bad")
	assert.Error(t, err)
	assert.False(t, ok)
}
