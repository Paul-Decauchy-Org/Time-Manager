package repositories

import (
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	timeTableEntriesMapper "github.com/epitech/timemanager/internal/mappers/timeTableEntries"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (r *Repository) GetTimeTableEntries() ([]*model.TimeTableEntry, error) {
	var entries []*dbmodels.TimeTableEntry

	if err := r.DB.Preload("User").Find(&entries).Error; err != nil {
		return nil, err
	}

	return timeTableEntriesMapper.DBTimeTableEntriesToGraph(entries), nil
}

// GetTimeTableEntriesFiltered returns entries filtered by optional user, team and date range (on Day string YYYY-MM-DD)
func (r *Repository) GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error) {
	var entries []*dbmodels.TimeTableEntry
	dbq := r.DB.Model(&dbmodels.TimeTableEntry{}).Preload("User")

	if userID != nil {
		dbq = dbq.Where("user_id = ?", *userID)
	}
	if teamID != nil {
		sub := r.DB.Table("team_users").Select("user_id").Where("team_id = ?", *teamID)
		dbq = dbq.Where("user_id IN (?)", sub)
	}
	if from != nil {
		fromStr := from.Format("2006-01-02")
		dbq = dbq.Where("day >= ?", fromStr)
	}
	if to != nil {
		toStr := to.Format("2006-01-02")
		dbq = dbq.Where("day <= ?", toStr)
	}

	if err := dbq.Order("day ASC, arrival ASC").Find(&entries).Error; err != nil {
		return nil, err
	}
	return timeTableEntriesMapper.DBTimeTableEntriesToGraph(entries), nil
}

// GetUserTimeTables fetches planned schedules for a user
func (r *Repository) GetUserTimeTables(userID uuid.UUID) ([]*dbmodels.TimeTable, error) {
	var rows []*dbmodels.TimeTable
	if err := r.DB.Where(&dbmodels.TimeTable{UserID: userID}).Find(&rows).Error; err != nil {
		return nil, err
	}
	return rows, nil
}

func (r *Repository) DBHandle() *gorm.DB { return r.DB }
