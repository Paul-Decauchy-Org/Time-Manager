package timeTableEntriesMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBTimeTableEntryToGraph(t *gmodel.TimeTableEntry) *model.TimeTableEntry {
	if t == nil {
		return nil
	}
	return &model.TimeTableEntry{
		ID:        t.ID.String(),
		UserID:    &model.User{ID: t.User.ID.String()},
		Day:       t.Day,
		Arrival:   t.Arrival,
		Departure: t.Departure,
		Status:    t.Status,
	}
}

func DBTimeTableEntriesToGraph(entries []*gmodel.TimeTableEntry) []*model.TimeTableEntry {
	out := make([]*model.TimeTableEntry, 0, len(entries))
	for i := range entries {
		out = append(out, DBTimeTableEntryToGraph(entries[i]))
	}
	return out
}
