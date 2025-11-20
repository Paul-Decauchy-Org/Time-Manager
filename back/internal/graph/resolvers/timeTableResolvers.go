package resolvers

import (
	"context"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/google/uuid"
)

const layoutISOs = "2006-01-02"

// Helpers pour réduire la complexité
func toUUIDPtr(s *string) *uuid.UUID {
	if s == nil || *s == "" {
		return nil
	}
	if v, err := uuid.Parse(*s); err == nil {
		return &v
	}
	return nil
}

func toTimePtr(s *string) *time.Time {
	if s == nil || *s == "" {
		return nil
	}
	if t, err := time.Parse(layoutISOs, *s); err == nil {
		return &t
	}
	return nil
}

func (r *queryResolver) TimeTableEntries(ctx context.Context, userID *string, teamID *string, from *string, to *string) ([]*model.TimeTableEntry, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER", "USER"); err != nil {
		return nil, err
	}

	// Pas de filtres -> fallback
	if userID == nil && teamID == nil && from == nil && to == nil {
		return r.TimeTableService.GetTimeTableEntries()
	}

	uid := toUUIDPtr(userID)
	tid := toUUIDPtr(teamID)
	fromT := toTimePtr(from)
	toT := toTimePtr(to)

	return r.TimeTableService.GetTimeTableEntriesFiltered(uid, tid, fromT, toT)
}
