package timeTableEntriesMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
	"log"
)

func DBTimeTableEntryToGraph(e *gmodel.TimeTableEntry) *model.TimeTableEntry {
	if e == nil {
		return nil
	}
	return &model.TimeTableEntry{
		ID:        e.ID.String(),
		Day:       e.Day,
		Arrival:   e.Arrival,
		Departure: e.Departure,
		Status:    e.Status,
		UserID:    &model.User{ID: e.UserID.String()},
	}
}

func DBTimeTableEntriesToGraph(entries []*gmodel.TimeTableEntry) []*model.TimeTableEntry {
	out := make([]*model.TimeTableEntry, 0, len(entries))
	for _, e := range entries {
		func(ent *gmodel.TimeTableEntry) {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("panic mapping TimeTableEntry (skipped): %v", r)
				}
			}()
			out = append(out, DBTimeTableEntryToGraph(ent))
		}(e)
	}
	return out
}
