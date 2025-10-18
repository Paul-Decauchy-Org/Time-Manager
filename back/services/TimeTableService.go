package services

import (
	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
)

type TimeTableService struct {
	Repo *repositories.Repository
}

func NewTimeTableService(repo *repositories.Repository) *TimeTableService {
	return &TimeTableService{Repo: repo}
}

func (s *TimeTableService) GetTimeTableEntries() ([]*model.TimeTableEntry, error) {
	return s.Repo.GetTimeTableEntries()
}
