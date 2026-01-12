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
	GetTeams() ([]*model.Team, error)
	GetTeamByUUID(teamID uuid.UUID) (*model.Team, error)
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

func (s *KpiService) ExportUserKpiCSV(ctx context.Context, userID *uuid.UUID, from, to time.Time) (string, error) {
	summary, err := s.GetUserKpiSummary(ctx, userID, from, to)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	if err := writer.Write([]string{
		"UserID",
		"From",
		"To",
		"WorkedMinutes",
		"OvertimeMinutes",
		"DaysPresent",
		"CurrentStreakDays",
		"PunctualityRate",
		"PresentNow",
	}); err != nil {
		return "", err
	}

	if err := writer.Write([]string{
		summary.UserID,
		summary.From,
		summary.To,
		strconv.Itoa(int(summary.WorkedMinutes)),
		strconv.Itoa(int(summary.OvertimeMinutes)),
		strconv.Itoa(int(summary.DaysPresent)),
		strconv.Itoa(int(summary.CurrentStreakDays)),
		fmt.Sprintf("%.2f", summary.PunctualityRate),
		strconv.FormatBool(summary.PresentNow),
	}); err != nil {
		return "", err
	}

	writer.Flush()
	return buf.String(), nil

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

// GetAdminKpiDashboard returns comprehensive KPI dashboard for admins
func (s *KpiService) GetAdminKpiDashboard(ctx context.Context, from, to time.Time) (*model.AdminKpiDashboard, error) {
	start, end := normalizeWindow(from, to)

	// Fetch all entries in the period
	entries, err := s.Repo.GetTimeTableEntriesFiltered(nil, nil, &start, &end)
	if err != nil {
		return nil, err
	}

	// Collect all unique users from entries
	userSet := make(map[string]struct{})
	for _, e := range entries {
		if e.UserID != nil {
			userSet[e.UserID.ID] = struct{}{}
		}
	}

	// Get all teams
	allTeams, err := s.Repo.GetTeams()
	if err != nil {
		allTeams = []*model.Team{}
	}

	summary := s.computeAdminSummary(entries, userSet, start, end)
	summary.TotalTeams = int32(len(allTeams))

	workload := s.computeWorkloadAnalysis(entries, userSet)
	punctuality := s.computePunctualityMetrics(entries)
	overtime := s.computeOvertimeReport(entries, userSet)
	compliance := s.computeComplianceMetrics(entries)
	productivity := s.computeProductivityMetrics(entries, userSet)
	teams := s.computeTeamDetailedReportsForAllTeams(ctx, allTeams, start, end)

	return &model.AdminKpiDashboard{
		Period: &model.DateRange{
			From: start.Format(layoutISO),
			To:   end.Format(layoutISO),
		},
		Summary:      summary,
		Workload:     workload,
		Punctuality:  punctuality,
		Overtime:     overtime,
		Compliance:   compliance,
		Productivity: productivity,
		Teams:        teams,
	}, nil
}

func (s *KpiService) computeAdminSummary(entries []*model.TimeTableEntry, userSet map[string]struct{}, start, end time.Time) *model.AdminKpiSummary {
	totalMinutes := 0
	activeUsers := make(map[string]struct{})
	now := time.Now()

	for _, e := range entries {
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(now.Sub(e.Arrival).Minutes())
			if e.UserID != nil {
				activeUsers[e.UserID.ID] = struct{}{}
			}
		}
		if dur > 0 {
			totalMinutes += dur
		}
	}

	avgHoursPerUser := 0.0
	if len(userSet) > 0 {
		avgHoursPerUser = float64(totalMinutes) / float64(len(userSet)) / 60.0
	}

	// Compliance rate (simplified: entries with departure / total)
	completeEntries := 0
	for _, e := range entries {
		if e.Departure != nil && !e.Departure.IsZero() {
			completeEntries++
		}
	}
	complianceRate := 0.0
	if len(entries) > 0 {
		complianceRate = float64(completeEntries) / float64(len(entries))
	}

	return &model.AdminKpiSummary{
		TotalUsers:       int32(len(userSet)),
		ActiveUsers:      int32(len(activeUsers)),
		TotalTeams:       0, // Will be filled from teams query
		TotalWorkedHours: int32(totalMinutes / 60),
		AvgHoursPerUser:  avgHoursPerUser,
		ComplianceRate:   complianceRate,
	}
}

func (s *KpiService) computeWorkloadAnalysis(entries []*model.TimeTableEntry, userSet map[string]struct{}) *model.WorkloadAnalysis {
	dailyMinutes := make(map[string]int)
	dayOfWeekMinutes := make(map[string]int)
	userOvertime := make(map[string]int)

	for _, e := range entries {
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(time.Since(e.Arrival).Minutes())
		}
		if dur > 0 {
			dailyMinutes[e.Day] += dur

			// Track day of week
			if dt, err := time.Parse(layoutISO, e.Day); err == nil {
				dayName := dt.Weekday().String()
				dayOfWeekMinutes[dayName] += dur
			}

			// Track overtime per user
			if e.UserID != nil && dur > defaultExpectedDailyMinutes {
				userOvertime[e.UserID.ID] += (dur - defaultExpectedDailyMinutes)
			}
		}
	}

	// Find peak day
	peakDay := ""
	peakMinutes := 0
	for day, min := range dailyMinutes {
		if min > peakMinutes {
			peakMinutes = min
			peakDay = day
		}
	}

	// Average daily and weekly
	totalMinutes := 0
	for _, min := range dailyMinutes {
		totalMinutes += min
	}
	avgDailyMinutes := 0.0
	if len(dailyMinutes) > 0 {
		avgDailyMinutes = float64(totalMinutes) / float64(len(dailyMinutes))
	}
	avgWeeklyMinutes := avgDailyMinutes * 5

	// Distribution by day
	distribution := make([]*model.DayDistribution, 0)
	for day, min := range dayOfWeekMinutes {
		days := 0
		for d := range dailyMinutes {
			if dt, err := time.Parse(layoutISO, d); err == nil && dt.Weekday().String() == day {
				days++
			}
		}
		avgMin := 0.0
		if days > 0 {
			avgMin = float64(min) / float64(days)
		}
		distribution = append(distribution, &model.DayDistribution{
			Day:          day,
			AvgMinutes:   avgMin,
			TotalMinutes: int32(min),
		})
	}

	// Total overtime
	totalOvertime := 0
	usersWithOvertime := 0
	for _, ot := range userOvertime {
		totalOvertime += ot
		if ot > 0 {
			usersWithOvertime++
		}
	}

	return &model.WorkloadAnalysis{
		AvgDailyMinutes:   avgDailyMinutes,
		AvgWeeklyMinutes:  avgWeeklyMinutes,
		PeakDayMinutes:    int32(peakMinutes),
		PeakDay:           peakDay,
		DistributionByDay: distribution,
		TotalOvertime:     int32(totalOvertime),
		UsersWithOvertime: int32(usersWithOvertime),
	}
}

func (s *KpiService) computePunctualityMetrics(entries []*model.TimeTableEntry) *model.PunctualityMetrics {
	onTimeCount := 0
	lateCount := 0
	totalLateMinutes := 0
	lateUsers := make(map[string]struct{})
	punctualUsers := make(map[string]struct{})
	weeklyData := make(map[string]*struct{ onTime, late, lateMin int })

	for _, e := range entries {
		arrival := e.Arrival
		threshold := time.Date(arrival.Year(), arrival.Month(), arrival.Day(), 10, 0, 0, 0, arrival.Location())

		// Get week start
		weekStart := arrival.AddDate(0, 0, -int(arrival.Weekday()))
		weekKey := weekStart.Format(layoutISO)
		if weeklyData[weekKey] == nil {
			weeklyData[weekKey] = &struct{ onTime, late, lateMin int }{}
		}

		if arrival.Before(threshold) || arrival.Equal(threshold) {
			onTimeCount++
			weeklyData[weekKey].onTime++
			if e.UserID != nil {
				punctualUsers[e.UserID.ID] = struct{}{}
			}
		} else {
			lateCount++
			lateMin := int(arrival.Sub(threshold).Minutes())
			totalLateMinutes += lateMin
			weeklyData[weekKey].late++
			weeklyData[weekKey].lateMin += lateMin
			if e.UserID != nil {
				lateUsers[e.UserID.ID] = struct{}{}
			}
		}
	}

	total := onTimeCount + lateCount
	onTimeRate := 0.0
	lateRate := 0.0
	avgLateMinutes := 0.0

	if total > 0 {
		onTimeRate = float64(onTimeCount) / float64(total)
		lateRate = float64(lateCount) / float64(total)
	}
	if lateCount > 0 {
		avgLateMinutes = float64(totalLateMinutes) / float64(lateCount)
	}

	// Build trends
	trends := make([]*model.PunctualityTrend, 0)
	for week, data := range weeklyData {
		total := data.onTime + data.late
		rate := 0.0
		avgLate := 0.0
		if total > 0 {
			rate = float64(data.onTime) / float64(total)
		}
		if data.late > 0 {
			avgLate = float64(data.lateMin) / float64(data.late)
		}
		trends = append(trends, &model.PunctualityTrend{
			WeekStart:      week,
			OnTimeRate:     rate,
			AvgLateMinutes: avgLate,
		})
	}
	sort.Slice(trends, func(i, j int) bool { return trends[i].WeekStart < trends[j].WeekStart })

	return &model.PunctualityMetrics{
		OnTimeRate:         onTimeRate,
		LateRate:           lateRate,
		AvgLateMinutes:     avgLateMinutes,
		TotalLateIncidents: int32(lateCount),
		PunctualUsers:      int32(len(punctualUsers)),
		LateUsers:          int32(len(lateUsers)),
		TrendByWeek:        trends,
	}
}

func (s *KpiService) computeOvertimeReport(entries []*model.TimeTableEntry, userSet map[string]struct{}) *model.OvertimeReport {
	userOvertimeMap := make(map[string]*struct {
		minutes int
		days    map[string]struct{}
		name    string
	})

	weeklyOvertime := make(map[string]*struct{ minutes, users int })

	for _, e := range entries {
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(time.Since(e.Arrival).Minutes())
		}

		if dur > defaultExpectedDailyMinutes && e.UserID != nil {
			overtime := dur - defaultExpectedDailyMinutes
			userID := e.UserID.ID

			if userOvertimeMap[userID] == nil {
				userName := e.UserID.FirstName + " " + e.UserID.LastName
				userOvertimeMap[userID] = &struct {
					minutes int
					days    map[string]struct{}
					name    string
				}{days: make(map[string]struct{}), name: userName}
			}
			userOvertimeMap[userID].minutes += overtime
			userOvertimeMap[userID].days[e.Day] = struct{}{}

			// Weekly aggregation
			if dt, err := time.Parse(layoutISO, e.Day); err == nil {
				weekStart := dt.AddDate(0, 0, -int(dt.Weekday()))
				weekKey := weekStart.Format(layoutISO)
				if weeklyOvertime[weekKey] == nil {
					weeklyOvertime[weekKey] = &struct{ minutes, users int }{}
				}
				weeklyOvertime[weekKey].minutes += overtime
			}
		}
	}

	// Count distinct users with overtime per week
	userWeekMap := make(map[string]map[string]struct{})
	for userID, data := range userOvertimeMap {
		for day := range data.days {
			if dt, err := time.Parse(layoutISO, day); err == nil {
				weekStart := dt.AddDate(0, 0, -int(dt.Weekday()))
				weekKey := weekStart.Format(layoutISO)
				if userWeekMap[weekKey] == nil {
					userWeekMap[weekKey] = make(map[string]struct{})
				}
				userWeekMap[weekKey][userID] = struct{}{}
			}
		}
	}
	for week, users := range userWeekMap {
		if weeklyOvertime[week] != nil {
			weeklyOvertime[week].users = len(users)
		}
	}

	totalOvertime := 0
	for _, data := range userOvertimeMap {
		totalOvertime += data.minutes
	}

	avgOvertimePerUser := 0.0
	if len(userSet) > 0 {
		avgOvertimePerUser = float64(totalOvertime) / float64(len(userSet))
	}

	// Top overtime users
	type userOT struct {
		id      string
		name    string
		minutes int
		days    int
	}
	topUsers := make([]userOT, 0)
	for userID, data := range userOvertimeMap {
		topUsers = append(topUsers, userOT{
			id:      userID,
			name:    data.name,
			minutes: data.minutes,
			days:    len(data.days),
		})
	}
	sort.Slice(topUsers, func(i, j int) bool { return topUsers[i].minutes > topUsers[j].minutes })
	if len(topUsers) > 10 {
		topUsers = topUsers[:10]
	}

	topOvertimeUsers := make([]*model.UserOvertimeDetail, 0)
	for _, u := range topUsers {
		topOvertimeUsers = append(topOvertimeUsers, &model.UserOvertimeDetail{
			UserID:          u.id,
			UserName:        u.name,
			OvertimeMinutes: int32(u.minutes),
			DaysWorked:      int32(u.days),
		})
	}

	// Overtime by week
	overtimeByWeek := make([]*model.OvertimeByPeriod, 0)
	for week, data := range weeklyOvertime {
		overtimeByWeek = append(overtimeByWeek, &model.OvertimeByPeriod{
			PeriodStart:  week,
			TotalMinutes: int32(data.minutes),
			UsersCount:   int32(data.users),
		})
	}
	sort.Slice(overtimeByWeek, func(i, j int) bool { return overtimeByWeek[i].PeriodStart < overtimeByWeek[j].PeriodStart })

	return &model.OvertimeReport{
		TotalOvertimeMinutes: int32(totalOvertime),
		AvgOvertimePerUser:   avgOvertimePerUser,
		UsersWithOvertime:    int32(len(userOvertimeMap)),
		TopOvertimeUsers:     topOvertimeUsers,
		OvertimeByWeek:       overtimeByWeek,
	}
}

func (s *KpiService) computeComplianceMetrics(entries []*model.TimeTableEntry) *model.ComplianceMetrics {
	missingClockouts := 0
	excessiveHours := 0
	weekendWork := 0
	usersWithIssues := make(map[string]struct{})

	for _, e := range entries {
		hasIssue := false

		// Missing clockout
		if (e.Departure == nil || e.Departure.IsZero()) && !e.Status {
			missingClockouts++
			hasIssue = true
		}

		// Excessive hours (>12h)
		if e.Departure != nil && !e.Departure.IsZero() {
			dur := int(e.Departure.Sub(e.Arrival).Minutes())
			if dur > 720 { // 12 hours
				excessiveHours++
				hasIssue = true
			}
		}

		// Weekend work
		if dt, err := time.Parse(layoutISO, e.Day); err == nil {
			if dt.Weekday() == time.Saturday || dt.Weekday() == time.Sunday {
				weekendWork++
				hasIssue = true
			}
		}

		if hasIssue && e.UserID != nil {
			usersWithIssues[e.UserID.ID] = struct{}{}
		}
	}

	completeEntries := 0
	for _, e := range entries {
		if e.Departure != nil && !e.Departure.IsZero() {
			completeEntries++
		}
	}
	complianceRate := 0.0
	if len(entries) > 0 {
		complianceRate = float64(completeEntries) / float64(len(entries))
	}

	anomalies := []*model.ComplianceAnomaly{
		{
			Type:          "missing_clockout",
			Count:         int32(missingClockouts),
			Severity:      "medium",
			AffectedUsers: int32(len(usersWithIssues)),
		},
		{
			Type:          "excessive_hours",
			Count:         int32(excessiveHours),
			Severity:      "high",
			AffectedUsers: int32(len(usersWithIssues)),
		},
		{
			Type:          "weekend_work",
			Count:         int32(weekendWork),
			Severity:      "low",
			AffectedUsers: int32(len(usersWithIssues)),
		},
	}

	totalAnomalies := missingClockouts + excessiveHours + weekendWork

	return &model.ComplianceMetrics{
		MissingEntriesCount:    0, // Would need additional data to compute
		IncompleteEntriesCount: int32(missingClockouts),
		AnomaliesCount:         int32(totalAnomalies),
		ComplianceRate:         complianceRate,
		UsersWithIssues:        int32(len(usersWithIssues)),
		Anomalies:              anomalies,
	}
}

func (s *KpiService) computeProductivityMetrics(entries []*model.TimeTableEntry, userSet map[string]struct{}) *model.ProductivityMetrics {
	totalProductiveMinutes := 0
	userProductivity := make(map[string]*struct {
		minutes int
		name    string
	})
	dailyProductivity := make(map[string]*struct{ minutes, users int })

	for _, e := range entries {
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(time.Since(e.Arrival).Minutes())
		}

		if dur > 0 {
			totalProductiveMinutes += dur

			if e.UserID != nil {
				userID := e.UserID.ID
				if userProductivity[userID] == nil {
					userName := e.UserID.FirstName + " " + e.UserID.LastName
					userProductivity[userID] = &struct {
						minutes int
						name    string
					}{name: userName}
				}
				userProductivity[userID].minutes += dur
			}

			if dailyProductivity[e.Day] == nil {
				dailyProductivity[e.Day] = &struct{ minutes, users int }{}
			}
			dailyProductivity[e.Day].minutes += dur
		}
	}

	// Count distinct users per day
	dayUserMap := make(map[string]map[string]struct{})
	for _, e := range entries {
		if e.UserID != nil {
			if dayUserMap[e.Day] == nil {
				dayUserMap[e.Day] = make(map[string]struct{})
			}
			dayUserMap[e.Day][e.UserID.ID] = struct{}{}
		}
	}
	for day, users := range dayUserMap {
		if dailyProductivity[day] != nil {
			dailyProductivity[day].users = len(users)
		}
	}

	avgHoursPerUser := 0.0
	if len(userSet) > 0 {
		avgHoursPerUser = float64(totalProductiveMinutes) / float64(len(userSet)) / 60.0
	}

	// Efficiency rate (simplified: ratio of productive hours to expected)
	expectedTotal := len(userSet) * defaultExpectedDailyMinutes * len(dailyProductivity)
	avgEfficiencyRate := 0.0
	if expectedTotal > 0 {
		avgEfficiencyRate = float64(totalProductiveMinutes) / float64(expectedTotal)
	}

	// Top performers
	type userProd struct {
		id         string
		name       string
		efficiency float64
		hours      int
	}
	topPerformers := make([]userProd, 0)
	for userID, data := range userProductivity {
		expectedUserMinutes := defaultExpectedDailyMinutes * len(dailyProductivity)
		efficiency := 0.0
		if expectedUserMinutes > 0 {
			efficiency = float64(data.minutes) / float64(expectedUserMinutes)
		}
		topPerformers = append(topPerformers, userProd{
			id:         userID,
			name:       data.name,
			efficiency: efficiency,
			hours:      data.minutes / 60,
		})
	}
	sort.Slice(topPerformers, func(i, j int) bool { return topPerformers[i].efficiency > topPerformers[j].efficiency })
	if len(topPerformers) > 10 {
		topPerformers = topPerformers[:10]
	}

	topPerformersList := make([]*model.UserProductivityDetail, 0)
	for _, p := range topPerformers {
		topPerformersList = append(topPerformersList, &model.UserProductivityDetail{
			UserID:         p.id,
			UserName:       p.name,
			EfficiencyRate: p.efficiency,
			TotalHours:     int32(p.hours),
		})
	}

	// Productivity trend
	productivityTrend := make([]*model.ProductivityTrend, 0)
	for day, data := range dailyProductivity {
		expectedDay := data.users * defaultExpectedDailyMinutes
		avgEff := 0.0
		if expectedDay > 0 {
			avgEff = float64(data.minutes) / float64(expectedDay)
		}
		productivityTrend = append(productivityTrend, &model.ProductivityTrend{
			Date:          day,
			AvgEfficiency: avgEff,
			TotalHours:    int32(data.minutes / 60),
		})
	}
	sort.Slice(productivityTrend, func(i, j int) bool { return productivityTrend[i].Date < productivityTrend[j].Date })

	return &model.ProductivityMetrics{
		AvgEfficiencyRate:    avgEfficiencyRate,
		TotalProductiveHours: int32(totalProductiveMinutes / 60),
		AvgHoursPerUser:      avgHoursPerUser,
		TopPerformers:        topPerformersList,
		ProductivityTrend:    productivityTrend,
	}
}

func (s *KpiService) computeTeamDetailedReports(ctx context.Context, entries []*model.TimeTableEntry, start, end time.Time) []*model.TeamDetailedReport {
	// Note: This function needs to be called per team with team-filtered entries
	// For now, return empty as it should be called via GetAdvancedKpisByTeam
	return make([]*model.TeamDetailedReport, 0)
}

func (s *KpiService) computeTeamDetailedReportsForAllTeams(ctx context.Context, teams []*model.Team, start, end time.Time) []*model.TeamDetailedReport {
	reports := make([]*model.TeamDetailedReport, 0)

	for _, team := range teams {
		if team == nil {
			continue
		}

		// Parse team ID
		teamID, err := uuid.Parse(team.ID)
		if err != nil {
			continue
		}

		// Get entries for this team
		entries, err := s.Repo.GetTimeTableEntriesFiltered(nil, &teamID, &start, &end)
		if err != nil {
			continue
		}

		report := s.computeSingleTeamReport(ctx, team.ID, entries)
		reports = append(reports, report)
	}

	return reports
}

func (s *KpiService) computeSingleTeamReport(ctx context.Context, teamID string, entries []*model.TimeTableEntry) *model.TeamDetailedReport {
	totalMinutes := 0
	userMinutes := make(map[string]*struct {
		minutes  int
		overtime int
		days     map[string]struct{}
		name     string
	})
	activeNow := make(map[string]struct{})
	teamName := "Unknown Team"

	// Try to get team name from repository
	if tid, err := uuid.Parse(teamID); err == nil {
		if team, err := s.Repo.GetTeamByUUID(tid); err == nil && team != nil {
			teamName = team.Name
		}
	}

	for _, e := range entries {
		dur := 0
		if e.Departure != nil && !e.Departure.IsZero() {
			dur = int(e.Departure.Sub(e.Arrival).Minutes())
		} else if e.Status {
			dur = int(time.Since(e.Arrival).Minutes())
			if e.UserID != nil {
				activeNow[e.UserID.ID] = struct{}{}
			}
		}

		if dur > 0 {
			totalMinutes += dur

			if e.UserID != nil {
				userID := e.UserID.ID
				if userMinutes[userID] == nil {
					userName := e.UserID.FirstName + " " + e.UserID.LastName
					userMinutes[userID] = &struct {
						minutes  int
						overtime int
						days     map[string]struct{}
						name     string
					}{days: make(map[string]struct{}), name: userName}
				}
				userMinutes[userID].minutes += dur
				userMinutes[userID].days[e.Day] = struct{}{}

				if dur > defaultExpectedDailyMinutes {
					userMinutes[userID].overtime += (dur - defaultExpectedDailyMinutes)
				}
			}
		}
	}

	memberCount := len(userMinutes)
	avgMinutesPerMember := 0.0
	if memberCount > 0 {
		avgMinutesPerMember = float64(totalMinutes) / float64(memberCount)
	}

	// Top contributors
	type contributor struct {
		id       string
		name     string
		minutes  int
		days     int
		overtime int
	}
	contributors := make([]contributor, 0)
	for userID, data := range userMinutes {
		contributors = append(contributors, contributor{
			id:       userID,
			name:     data.name,
			minutes:  data.minutes,
			days:     len(data.days),
			overtime: data.overtime,
		})
	}
	sort.Slice(contributors, func(i, j int) bool { return contributors[i].minutes > contributors[j].minutes })
	if len(contributors) > 5 {
		contributors = contributors[:5]
	}

	topContributors := make([]*model.TeamMemberContribution, 0)
	for _, c := range contributors {
		topContributors = append(topContributors, &model.TeamMemberContribution{
			UserID:          c.id,
			UserName:        c.name,
			WorkedMinutes:   int32(c.minutes),
			DaysPresent:     int32(c.days),
			OvertimeMinutes: int32(c.overtime),
		})
	}

	// Workload distribution
	ranges := map[string]int{
		"0-40h":  0,
		"40-50h": 0,
		"50+h":   0,
	}
	for _, data := range userMinutes {
		hours := data.minutes / 60
		if hours < 40 {
			ranges["0-40h"]++
		} else if hours < 50 {
			ranges["40-50h"]++
		} else {
			ranges["50+h"]++
		}
	}

	workloadDist := make([]*model.WorkloadDistribution, 0)
	for rangeName, count := range ranges {
		percentage := 0.0
		if memberCount > 0 {
			percentage = float64(count) / float64(memberCount)
		}
		workloadDist = append(workloadDist, &model.WorkloadDistribution{
			Range:      rangeName,
			UserCount:  int32(count),
			Percentage: percentage,
		})
	}

	return &model.TeamDetailedReport{
		TeamID:               teamID,
		TeamName:             teamName,
		MemberCount:          int32(memberCount),
		TotalWorkedMinutes:   int32(totalMinutes),
		AvgMinutesPerMember:  avgMinutesPerMember,
		ActiveNow:            int32(len(activeNow)),
		TopContributors:      topContributors,
		WorkloadDistribution: workloadDist,
	}
}
