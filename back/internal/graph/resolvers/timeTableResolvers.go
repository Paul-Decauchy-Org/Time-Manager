package resolvers

import (
	"context"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/google/uuid"
)

func (r *queryResolver) TimeTableEntries(ctx context.Context, userID *string, teamID *string, from *string, to *string) ([]*model.TimeTableEntry, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER", "USER"); err != nil {
		return nil, err
	}
	// If no filters provided, fallback to existing behavior
	if userID == nil && teamID == nil && from == nil && to == nil {
		return r.TimeTableService.GetTimeTableEntries()
	}

	var uid *uuid.UUID
	var tid *uuid.UUID
	var fromT, toT *time.Time

	if userID != nil && *userID != "" {
		if parsed, err := uuid.Parse(*userID); err == nil {
			uid = &parsed
		}
	}
	if teamID != nil && *teamID != "" {
		if parsed, err := uuid.Parse(*teamID); err == nil {
			tid = &parsed
		}
	}
	if from != nil && *from != "" {
		if t, err := time.Parse("2006-01-02", *from); err == nil {
			fromT = &t
		}
	}
	if to != nil && *to != "" {
		if t, err := time.Parse("2006-01-02", *to); err == nil {
			toT = &t
		}
	}

	return r.TimeTableService.GetTimeTableEntriesFiltered(uid, tid, fromT, toT)
}
