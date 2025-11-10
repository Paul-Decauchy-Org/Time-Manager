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

// GetTeamKpiSummary aggregates KPIs for a team in a date range.
// - totalWorkedMinutes: sum of durations for all entries in window
// - avgWorkedMinutesPerUser: total / distinct users appearing in entries
// - activeUsers: users with an open entry (status true and no departure) at query time
// - coverage: number of concurrent users per hour slice (ISO timestamps)
func (s *KpiService) GetTeamKpiSummary(ctx context.Context, teamID uuid.UUID, from, to time.Time) (*model.TeamKpiSummary, error) {
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

	// fetch entries filtered by team and date range
	tid := teamID
	entries, err := s.Repo.GetTimeTableEntriesFiltered(nil, &tid, &start, &end)
	if err != nil {
		return nil, err
	}

	totalWorkedMinutes := 0
	distinctUsers := map[string]struct{}{}
	activeNow := map[string]struct{}{}
	coverageCounts := map[string]int{}

	now := time.Now()
	for _, e := range entries {
		// track distinct users
		if e.UserID != nil {
			distinctUsers[e.UserID.ID] = struct{}{}
		}
		arr := e.Arrival
		dep := e.Departure
		effectiveDep := dep
		if dep == nil || dep.IsZero() {
			if e.Status {
				effectiveDep = &now
				if e.UserID != nil {
					activeNow[e.UserID.ID] = struct{}{}
				}
			}
		}
		if effectiveDep == nil || effectiveDep.Before(arr) {
			continue
		}
		durMin := int(effectiveDep.Sub(arr).Minutes())
		if durMin < 0 {
			durMin = 0
		}
		totalWorkedMinutes += durMin

		// coverage per hour buckets
		sh := arr.Truncate(time.Hour)
		eh := effectiveDep.Truncate(time.Hour)
		for cur := sh; !cur.After(eh); cur = cur.Add(time.Hour) {
			// ignore buckets completely outside requested window
			if cur.Before(start) && cur.Add(time.Hour).Before(start) {
				continue
			}
			if cur.After(end) {
				break
			}
			key := cur.Format(time.RFC3339)
			coverageCounts[key]++
		}
	}

	avg := 0.0
	if len(distinctUsers) > 0 {
		avg = float64(totalWorkedMinutes) / float64(len(distinctUsers))
	}

	// build sorted coverage slice
	type kv struct {
		t string
		v int
	}
	tmp := make([]kv, 0, len(coverageCounts))
	for k, v := range coverageCounts {
		tmp = append(tmp, kv{t: k, v: v})
	}
	sort.Slice(tmp, func(i, j int) bool { return tmp[i].t < tmp[j].t })
	cov := make([]*model.CoveragePoint, 0, len(tmp))
	for _, p := range tmp {
		if ts, err := time.Parse(time.RFC3339, p.t); err == nil {
			cov = append(cov, &model.CoveragePoint{Time: ts, Count: int32(p.v)})
		}
	}

	out := &model.TeamKpiSummary{
		From:                    start.Format("2006-01-02"),
		To:                      end.Format("2006-01-02"),
		TeamID:                  teamID.String(),
		TotalWorkedMinutes:      int32(totalWorkedMinutes),
		AvgWorkedMinutesPerUser: avg,
		ActiveUsers:             int32(len(activeNow)),
		Coverage:                cov,
	}
	return out, nil
}
