package services

import (
	"errors"
	"testing"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockAuthRepo struct{ mock.Mock }

func (m *MockAuthRepo) SignUp(input model.SignUpInput) (*model.User, error) {
	args := m.Called(input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}
func (m *MockAuthRepo) Login(email, password string) (*model.User, error) {
	args := m.Called(email, password)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}
func (m *MockAuthRepo) Me(email string) (*model.SignedUser, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.SignedUser), args.Error(1)
}
func (m *MockAuthRepo) UpdateProfile(email string, input model.UpdateProfileInput) (*model.User, error) {
	args := m.Called(email, input)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}
func (m *MockAuthRepo) DeleteProfile(email string) (bool, error) {
	args := m.Called(email)
	return args.Bool(0), args.Error(1)
}

// adapter to satisfy constructor w/o changing other code: we define only used methods via embedding
// Ensure MockAuthRepo satisfies AuthRepository
var _ AuthRepository = (*MockAuthRepo)(nil)

func TestAuthServiceLoginSuccess(t *testing.T) {
	mockRepo := new(MockAuthRepo)
	svc := NewAuthService(mockRepo)
	// override token generator for deterministic output
	svc.TokenGen = func(email, id, role string) (string, error) { return "TOKEN", nil }

	user := &model.User{ID: "u1", Email: "e@e", Role: model.RoleUser, FirstName: "A", LastName: "B", Phone: "p"}
	mockRepo.On("Login", "e@e", "pwd").Return(user, nil)

	out, err := svc.Login("e@e", "pwd")
	assert.NoError(t, err)
	assert.Equal(t, "TOKEN", out.Token)
	assert.Equal(t, user.FirstName, out.FirstName)
}

func TestAuthServiceLoginRepoError(t *testing.T) {
	mockRepo := new(MockAuthRepo)
	svc := NewAuthService(mockRepo)
	svc.TokenGen = func(email, id, role string) (string, error) { return "X", nil }
	mockRepo.On("Login", "e@e", "pwd").Return(nil, errors.New("boom"))
	out, err := svc.Login("e@e", "pwd")
	assert.Error(t, err)
	assert.Nil(t, out)
}

func TestAuthServiceLoginTokenError(t *testing.T) {
	mockRepo := new(MockAuthRepo)
	svc := NewAuthService(mockRepo)
	svc.TokenGen = func(email, id, role string) (string, error) { return "", errors.New("tok") }
	user := &model.User{ID: "u1", Email: "e@e", Role: model.RoleUser}
	mockRepo.On("Login", "e@e", "pwd").Return(user, nil)
	out, err := svc.Login("e@e", "pwd")
	assert.Error(t, err)
	assert.Nil(t, out)
}

func TestAuthServicePassThroughs(t *testing.T) {
	mockRepo := new(MockAuthRepo)
	svc := NewAuthService(mockRepo)

	in := model.SignUpInput{Email: "e", Password: "p", FirstName: "A", LastName: "B", Phone: "x"}
	u := &model.User{Email: "e"}
	mockRepo.On("SignUp", in).Return(u, nil)
	got, err := svc.SignUp(in)
	assert.NoError(t, err)
	assert.Equal(t, u, got)

	signedUser := &model.SignedUser{Email: "e", FirstName: "A"}
	mockRepo.On("Me", "e").Return(signedUser, nil)
	me, err := svc.Me("e")
	assert.NoError(t, err)
	assert.Equal(t, signedUser, me)

	up := model.UpdateProfileInput{FirstName: func() *string { s := "Z"; return &s }()}
	u2 := &model.User{FirstName: "Z"}
	mockRepo.On("UpdateProfile", "e", up).Return(u2, nil)
	got2, err := svc.UpdateProfile("e", up)
	assert.NoError(t, err)
	assert.Equal(t, u2, got2)

	mockRepo.On("DeleteProfile", "e").Return(true, nil)
	ok, err := svc.DeleteProfile("e")
	assert.NoError(t, err)
	assert.True(t, ok)

	mockRepo.AssertExpectations(t)
}
