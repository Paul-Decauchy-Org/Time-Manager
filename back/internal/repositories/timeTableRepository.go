package repositories

import (
	"github.com/epitech/timemanager/internal/graph/model"
	timeTableEntriesMapper "github.com/epitech/timemanager/internal/mappers/timeTableEntries"
	dbmodels "github.com/epitech/timemanager/internal/models"
)

func (r *Repository) GetTimeTableEntries() ([]*model.TimeTableEntry, error) {
	var entries []*dbmodels.TimeTableEntry

	if err := r.DB.Preload("User").Find(&entries).Error; err != nil {
		return nil, err
	}

	return timeTableEntriesMapper.DBTimeTableEntriesToGraph(entries), nil
}
