package resolvers

import (
	"context"
	"errors"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/google/uuid"
)

func (r *queryResolver) KpiUserSummary(ctx context.Context, userID *string, from *string, to *string) (*model.UserKpiSummary, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER", "USER"); err != nil {
		return nil, err
	}
	var uid *uuid.UUID
	if userID != nil && *userID != "" {
		if parsed, err := uuid.Parse(*userID); err == nil {
			uid = &parsed
		}
	}
	var fromT, toT time.Time
	if from != nil && *from != "" {
		if t, err := time.Parse("2006-01-02", *from); err == nil {
			fromT = t
		}
	}
	if to != nil && *to != "" {
		if t, err := time.Parse("2006-01-02", *to); err == nil {
			toT = t
		}
	}
	return r.KpiService.GetUserKpiSummary(ctx, uid, fromT, toT)
}

func (r *queryResolver) KpiTeamSummary(ctx context.Context, teamID string, from *string, to *string) (*model.TeamKpiSummary, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}
	if teamID == "" {
		return nil, errors.New("teamID required")
	}
	tid, err := uuid.Parse(teamID)
	if err != nil {
		return nil, errors.New("invalid teamID")
	}
	var fromT, toT time.Time
	if from != nil && *from != "" {
		if t, err := time.Parse("2006-01-02", *from); err == nil { fromT = t }
	}
	if to != nil && *to != "" {
		if t, err := time.Parse("2006-01-02", *to); err == nil { toT = t }
	}
	return r.KpiService.GetTeamKpiSummary(ctx, tid, fromT, toT)
}
