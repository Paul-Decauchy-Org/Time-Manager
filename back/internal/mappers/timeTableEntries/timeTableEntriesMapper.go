package timeTableEntriesMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"log"
	"time"
)

func DBTimeTableEntryToGraph(e *gmodel.TimeTableEntry) *model.TimeTableEntry {
	if e == nil {
		return nil
	}
	return &model.TimeTableEntry{
		ID:        e.ID.String(),
		Day:       e.Day,
		Arrival:   e.Arrival,
		Departure: &e.Departure,
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

func GraphTimeTableEntryToDB(e *model.TimeTableEntry) *gmodel.TimeTableEntry {
	if e == nil {
		return nil
	}

	entry := &gmodel.TimeTableEntry{
		Day:     e.Day,
		Arrival: e.Arrival,
		Status:  e.Status,
	}

	// Gérer correctement le champ Departure qui est un pointeur dans le modèle GraphQL
	if e.Departure != nil {
		entry.Departure = *e.Departure
	} else {
		entry.Departure = time.Time{}
	}

	if e.UserID != nil {
		if userUUID, err := uuid.Parse(e.UserID.ID); err == nil {
			entry.UserID = userUUID
		}
	}
	return entry
}

func GraphTimeTableEntriesToDB(entries []*model.TimeTableEntry) []*gmodel.TimeTableEntry {
	if entries == nil {
		return nil
	}

	out := make([]*gmodel.TimeTableEntry, 0, len(entries))
	for _, e := range entries {
		func(ent *model.TimeTableEntry) {
			defer func() {
				if r := recover(); r != nil {
					log.Printf("panic mapping TimeTableEntry (skipped): %v", r)
				}
			}()
			out = append(out, GraphTimeTableEntryToDB(ent))
		}(e)
	}
	return out
}
