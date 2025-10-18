package repositories

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"gorm.io/gorm"
)

type Repository struct {
	DB *gorm.DB
}

func (r *Repository) GetTeamUsers() []*model.TeamUser {
	var teamUsers []*model.TeamUser
	if err := r.DB.Find(&teamUsers).Error; err != nil {
		return nil
	}
	return teamUsers
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{DB: db}
}
