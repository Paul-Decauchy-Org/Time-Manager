package services

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"sort"
	"strconv"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/google/uuid"
)

const layoutISO = "2006-01-02"

// KpiRepository is the minimal repository contract used by KpiService.
type KpiRepository interface {
	GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error)
}

type KpiService struct {
	Repo KpiRepository
}

func NewKpiService(repo KpiRepository) *KpiService {
	return &KpiService{Repo: repo}
}

// Default expected daily work duration in minutes (7h)
const defaultExpectedDailyMinutes = 7 * 60

// GetUserKpiSummary computes KPIs for a user in a date range; if userID is nil, returns zero-values
func (s *KpiService) GetUserKpiSummary(ctx context.Context, userID *uuid.UUID, from, to time.Time) (*model.UserKpiSummary, error) {
	start, end := normalizeWindow(from, to)

	entries, err := s.Repo.GetTimeTableEntriesFiltered(uidPtr(userID), nil, &start, &end)
	if err != nil {
		return nil, err
	}

	todayStr := time.Now().Format(layoutISO)
	workedMinutes, daily, presentNow, daySet := aggregateDaily(entries, todayStr)

	daysPresent := len(daySet)
	overtimeMinutes := 0
	expectedTotal := daysPresent * defaultExpectedDailyMinutes
	if workedMinutes > expectedTotal {
		overtimeMinutes = workedMinutes - expectedTotal
	}

	currentStreak := computeStreak(daySet)

	punctualDays, totalScheduledDays := computePunctuality(entries)
	punctualityRate := 0.0
	if totalScheduledDays > 0 {
		punctualityRate = float64(punctualDays) / float64(totalScheduledDays)
	}

	points := buildPoints(daily)

	uidOut := ""
	if userID != nil {
		uidOut = userID.String()
	}
	res := &model.UserKpiSummary{
		From:              start.Format(layoutISO),
		To:                end.Format(layoutISO),
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

func (s *KpiService) ExportUserKpiCSV(ctx context.Context, userID *uuid.UUID, from, to time.Time) ([]byte, error) {
	summary, err := s.GetUserKpiSummary(ctx, userID, from, to)
	if err != nil {
		return nil, err
	}
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	writer.Write([]string{
		"UserID",
		"From",
		"To",
		"WorkedMinutes",
		"OvertimeMinutes",
		"DaysPresent",
		"CurrentStreakDays",
		"PunctualityRate",
		"PresentNow",
	})
	
	writer.Write([]string{
		summary.UserID,
		summary.From,
		summary.To,
		strconv.Itoa(int(summary.WorkedMinutes)),
		strconv.Itoa(int(summary.OvertimeMinutes)),
		strconv.Itoa(int(summary.DaysPresent)),
		strconv.Itoa(int(summary.CurrentStreakDays)),
		fmt.Sprintf("%.2f", summary.PunctualityRate),
		strconv.FormatBool(summary.PresentNow),
	})

	writer.Write([]string{}) 

	writer.Flush()
	return buf.Bytes(), nil

}

func normalizeWindow(from, to time.Time) (time.Time, time.Time) {
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
	return start, end
}

func uidPtr(u *uuid.UUID) *uuid.UUID {
	if u == nil {
		return nil
	}
	tmp := *u
	return &tmp
}

func aggregateDaily(entries []*model.TimeTableEntry, todayStr string) (worked int, daily map[string]int, presentNow bool, daySet map[string]struct{}) {
	daily = map[string]int{}
	daySet = map[string]struct{}{}
	for _, e := range entries {
		day := e.Day
		daySet[day] = struct{}{}
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
		worked += dur
		daily[day] += dur
	}
	return
}

func computeStreak(daySet map[string]struct{}) int {
	if len(daySet) == 0 {
		return 0
	}
	keys := make([]string, 0, len(daySet))
	for d := range daySet {
		keys = append(keys, d)
	}
	sort.Strings(keys)
	cur := 0
	prev := ""
	for i := len(keys) - 1; i >= 0; i-- {
		d := keys[i]
		if prev == "" {
			cur = 1
			prev = d
			continue
		}
		pd, err := time.Parse(layoutISO, prev)
		if err != nil {
			break
		}
		if pd.AddDate(0, 0, -1).Format(layoutISO) == d {
			cur++
			prev = d
		} else {
			break
		}
	}
	return cur
}

func computePunctuality(entries []*model.TimeTableEntry) (punctualDays int, totalScheduled int) {
	for _, e := range entries {
		arrival := e.Arrival
		threshold := time.Date(arrival.Year(), arrival.Month(), arrival.Day(), 10, 0, 0, 0, arrival.Location())
		if arrival.Before(threshold) || arrival.Equal(threshold) {
			punctualDays++
		}
		totalScheduled++
	}
	return
}

func buildPoints(daily map[string]int) []*model.KpiPoint {
	points := make([]*model.KpiPoint, 0, len(daily))
	for d, m := range daily {
		dt, _ := time.Parse(layoutISO, d)
		points = append(points, &model.KpiPoint{Date: dt.Format(layoutISO), Minutes: int32(m)})
	}
	sort.Slice(points, func(i, j int) bool { return points[i].Date < points[j].Date })
	return points
}

// GetTeamKpiSummary aggregates KPIs for a team in a date range.
// - totalWorkedMinutes: sum of durations for all entries in window
// - avgWorkedMinutesPerUser: total / distinct users appearing in entries
// - activeUsers: users with an open entry (status true and no departure) at query time
// - coverage: number of concurrent users per hour slice (ISO timestamps)
func (s *KpiService) GetTeamKpiSummary(ctx context.Context, teamID uuid.UUID, from, to time.Time) (*model.TeamKpiSummary, error) {
	start, end := normalizeWindow(from, to)

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
		effectiveDep := effectiveDeparture(dep, e.Status, now)
		if effectiveDep == nil || effectiveDep.Before(arr) {
			continue
		}

		// count active now if entry is ongoing
		if (dep == nil || dep.IsZero()) && e.Status && e.UserID != nil {
			activeNow[e.UserID.ID] = struct{}{}
		}

		durMin := int(effectiveDep.Sub(arr).Minutes())
		if durMin < 0 {
			durMin = 0
		}
		totalWorkedMinutes += durMin

		// coverage per hour buckets
		addCoverageBuckets(coverageCounts, arr, *effectiveDep, start, end)
	}

	avg := 0.0
	if len(distinctUsers) > 0 {
		avg = float64(totalWorkedMinutes) / float64(len(distinctUsers))
	}

	// build sorted coverage slice
	cov := buildCoveragePoints(coverageCounts)

	out := &model.TeamKpiSummary{
		From:                    start.Format(layoutISO),
		To:                      end.Format(layoutISO),
		TeamID:                  teamID.String(),
		TotalWorkedMinutes:      int32(totalWorkedMinutes),
		AvgWorkedMinutesPerUser: avg,
		ActiveUsers:             int32(len(activeNow)),
		Coverage:                cov,
	}
	return out, nil
}

func effectiveDeparture(dep *time.Time, status bool, now time.Time) *time.Time {
	if dep == nil || dep.IsZero() {
		if status {
			return &now
		}
		return nil
	}
	return dep
}

func addCoverageBuckets(coverageCounts map[string]int, arr time.Time, effDep time.Time, start, end time.Time) {
	sh := arr.Truncate(time.Hour)
	eh := effDep.Truncate(time.Hour)
	for cur := sh; !cur.After(eh); cur = cur.Add(time.Hour) {
		if cur.Add(time.Hour).Before(start) {
			continue
		}
		if cur.After(end) {
			break
		}
		key := cur.Format(time.RFC3339)
		coverageCounts[key]++
	}
}

func buildCoveragePoints(coverageCounts map[string]int) []*model.CoveragePoint {
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
	return cov
}
