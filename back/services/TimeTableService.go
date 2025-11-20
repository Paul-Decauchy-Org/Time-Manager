package services

import (
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/google/uuid"
)

type TimeTableService struct {
	Repo TimeTableRepository
}

type TimeTableRepository interface {
	GetTimeTableEntries() ([]*model.TimeTableEntry, error)
	GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error)
}

func NewTimeTableService(repo TimeTableRepository) *TimeTableService {
	return &TimeTableService{Repo: repo}
}

func (s *TimeTableService) GetTimeTableEntries() ([]*model.TimeTableEntry, error) {
	return s.Repo.GetTimeTableEntries()
}

func (s *TimeTableService) GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error) {
	return s.Repo.GetTimeTableEntriesFiltered(userID, teamID, from, to)
}
