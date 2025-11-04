package resolvers

import (
    "context"
    "time"

    "github.com/epitech/timemanager/internal/graph/model"
    "github.com/epitech/timemanager/package/middlewares"
    "github.com/google/uuid"
)

// kpiUserSummary resolver
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

// kpiTeamSummary resolver (basic placeholder)
func (r *queryResolver) KpiTeamSummary(ctx context.Context, teamID string, from *string, to *string) (*model.TeamKpiSummary, error) {
    if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
        return nil, err
    }
    // Placeholder zero implementation until service is implemented
    var fromS, toS string
    if from != nil {
        fromS = *from
    }
    if to != nil {
        toS = *to
    }
    return &model.TeamKpiSummary{
        From:                  fromS,
        To:                    toS,
        TeamID:                teamID,
        TotalWorkedMinutes:    0,
        AvgWorkedMinutesPerUser: 0,
        ActiveUsers:           0,
        Coverage:              []*model.CoveragePoint{},
    }, nil
}
