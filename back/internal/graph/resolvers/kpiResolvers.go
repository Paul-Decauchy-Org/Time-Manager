package resolvers

import (
	"context"
	"errors"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/google/uuid"
)

const layoutISO = "2006-01-02"

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
		if t, err := time.Parse(layoutISO, *from); err == nil {
			fromT = t
		}
	}
	if to != nil && *to != "" {
		if t, err := time.Parse(layoutISO, *to); err == nil {
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
		if t, err := time.Parse(layoutISO, *from); err == nil {
			fromT = t
		}
	}
	if to != nil && *to != "" {
		if t, err := time.Parse(layoutISO, *to); err == nil {
			toT = t
		}
	}
	return r.KpiService.GetTeamKpiSummary(ctx, tid, fromT, toT)
}

func (r *queryResolver) ExportUserKpiCSV(ctx context.Context, userID *string, from *string, to *string) (string, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER", "USER"); err != nil {
		return "", err
	}
	var userUUID *uuid.UUID
	if userID != nil && *userID != "" {
		parsed, err := uuid.Parse(*userID)
		if err != nil {
			return "", errors.New("invalid userID")
		}
		userUUID = &parsed
	}

	var fromDate time.Time
	if from != nil && *from != "" {
		t, err := time.Parse(layoutISO, *from)
		if err != nil {
			return "", errors.New("invalid from date, expected YYYY-MM-DD")
		}
		fromDate = t
	}

	var toDate time.Time
	if to != nil && *to != "" {
		t, err := time.Parse(layoutISO, *to)
		if err != nil {
			return "", errors.New("invalid to date, expected YYYY-MM-DD")
		}
		toDate = t
	}

	csvData, err := r.KpiService.ExportUserKpiCSV(ctx, userUUID, fromDate, toDate)
	if err != nil {
		return "", err
	}
	return string(csvData), nil
}

// AdminKpiDashboard returns comprehensive KPI dashboard for admins
func (r *queryResolver) AdminKpiDashboard(ctx context.Context, from *string, to *string) (*model.AdminKpiDashboard, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	var fromT, toT time.Time
	if from != nil && *from != "" {
		if t, err := time.Parse(layoutISO, *from); err == nil {
			fromT = t
		}
	}
	if to != nil && *to != "" {
		if t, err := time.Parse(layoutISO, *to); err == nil {
			toT = t
		}
	}

	return r.KpiService.GetAdminKpiDashboard(ctx, fromT, toT)
}

// WorkloadAnalysis returns workload analysis metrics
func (r *queryResolver) WorkloadAnalysis(ctx context.Context, teamID *string, from *string, to *string) (*model.WorkloadAnalysis, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Workload, nil
}

// PunctualityMetrics returns punctuality metrics
func (r *queryResolver) PunctualityMetrics(ctx context.Context, teamID *string, from *string, to *string) (*model.PunctualityMetrics, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Punctuality, nil
}

// OvertimeReport returns overtime report
func (r *queryResolver) OvertimeReport(ctx context.Context, teamID *string, from *string, to *string) (*model.OvertimeReport, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Overtime, nil
}

// ComplianceMetrics returns compliance metrics
func (r *queryResolver) ComplianceMetrics(ctx context.Context, teamID *string, from *string, to *string) (*model.ComplianceMetrics, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Compliance, nil
}

// ProductivityMetrics returns productivity metrics
func (r *queryResolver) ProductivityMetrics(ctx context.Context, teamID *string, from *string, to *string) (*model.ProductivityMetrics, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Productivity, nil
}

// TeamDetailedReports returns detailed reports for all teams
func (r *queryResolver) TeamDetailedReports(ctx context.Context, from *string, to *string) ([]*model.TeamDetailedReport, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER"); err != nil {
		return nil, err
	}

	dashboard, err := r.AdminKpiDashboard(ctx, from, to)
	if err != nil {
		return nil, err
	}

	return dashboard.Teams, nil
}
