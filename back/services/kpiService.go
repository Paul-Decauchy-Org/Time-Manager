package services

import (
	"context"
	"sort"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/repositories"
	"github.com/google/uuid"
)

type KpiService struct {
	Repo *repositories.Repository
}

func NewKpiService(repo *repositories.Repository) *KpiService {
	return &KpiService{Repo: repo}
}

// Default expected daily work duration in minutes (7h)
const defaultExpectedDailyMinutes = 7 * 60

// GetUserKpiSummary computes KPIs for a user in a date range; if userID is nil, returns zero-values
func (s *KpiService) GetUserKpiSummary(ctx context.Context, userID *uuid.UUID, from, to time.Time) (*model.UserKpiSummary, error) {
	// Guard dates: ensure from <= to; if zero values, derive a sane window: last 30 days
	end := to
	start := from
	if end.IsZero() {
		end = time.Now()
	}
	if start.IsZero() {
		start = end.AddDate(0, 0, -30)
	}
	if start.After(end) {
		start, end = end, start
	}

	var uidStr string
	if userID != nil {
		uidStr = userID.String()
	}

	// Fetch entries
	var uidPtr *uuid.UUID
	if uidStr != "" {
		tmp := *userID
		uidPtr = &tmp
	}
	entries, err := s.Repo.GetTimeTableEntriesFiltered(uidPtr, nil, &start, &end)
	if err != nil {
		return nil, err
	}

	// Aggregate by day and compute totals
	workedMinutes := 0
	overtimeMinutes := 0
	daysPresentSet := map[string]struct{}{}
	currentStreak := 0
	presentNow := false
	punctualDays := 0
	totalScheduledDays := 0

	// Daily points
	daily := map[string]int{}
	todayStr := time.Now().Format("2006-01-02")

	for _, e := range entries {
		day := e.Day
		daysPresentSet[day] = struct{}{}
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(time.Since(e.Arrival).Minutes())
			if day == todayStr {
				presentNow = true
			}
		}
		if dur < 0 {
			dur = 0
		}
		workedMinutes += dur
		daily[day] += dur
	}

	daysPresent := len(daysPresentSet)
	expectedTotal := daysPresent * defaultExpectedDailyMinutes
	if workedMinutes > expectedTotal {
		overtimeMinutes = workedMinutes - expectedTotal
	}

	if daysPresent > 0 {
		var dayKeys []string
		for d := range daysPresentSet {
			dayKeys = append(dayKeys, d)
		}
		sort.Strings(dayKeys)
		cur := 0
		prev := ""
		for i := len(dayKeys) - 1; i >= 0; i-- {
			d := dayKeys[i]
			if prev == "" {
				cur = 1
				prev = d
				continue
			}
			// check if previous day is exactly -1 day
			pd, _ := time.Parse("2006-01-02", prev)
			if pd.AddDate(0, 0, -1).Format("2006-01-02") == d {
				cur++
				prev = d
			} else {
				break
			}
		}
		currentStreak = cur
	}

	for _, e := range entries {
		if e.Status && (e.Departure == nil || e.Departure.IsZero()) {
			// skip ongoing record for punctuality sample; use arrival time only
		}
		arrivalLocal := e.Arrival
		threshold := time.Date(arrivalLocal.Year(), arrivalLocal.Month(), arrivalLocal.Day(), 10, 0, 0, 0, arrivalLocal.Location())
		if arrivalLocal.Before(threshold) || arrivalLocal.Equal(threshold) {
			punctualDays++
		}
		totalScheduledDays++
	}
	punctualityRate := 0.0
	if totalScheduledDays > 0 {
		punctualityRate = float64(punctualDays) / float64(totalScheduledDays)
	}

	// Build daily points slice
	points := make([]*model.KpiPoint, 0, len(daily))
	for d, m := range daily {
		// parse date
		dt, _ := time.Parse("2006-01-02", d)
		points = append(points, &model.KpiPoint{Date: dt.Format("2006-01-02"), Minutes: int32(m)})
	}
	sort.Slice(points, func(i, j int) bool { return points[i].Date < points[j].Date })

	uidOut := ""
	if userID != nil {
		uidOut = userID.String()
	}
	res := &model.UserKpiSummary{
		From:              start.Format("2006-01-02"),
		To:                end.Format("2006-01-02"),
		UserID:            uidOut,
		WorkedMinutes:     int32(workedMinutes),
		OvertimeMinutes:   int32(overtimeMinutes),
		DaysPresent:       int32(daysPresent),
		CurrentStreakDays: int32(currentStreak),
		PunctualityRate:   punctualityRate,
		PresentNow:        presentNow,
		DailyWorked:       points,
	}
	return res, nil
}
