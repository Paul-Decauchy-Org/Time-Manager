package services

import (
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
	"github.com/google/uuid"
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

func (s *TimeTableService) GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error) {
	return s.Repo.GetTimeTableEntriesFiltered(userID, teamID, from, to)
}
