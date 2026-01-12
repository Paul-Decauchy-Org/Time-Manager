package services

import (
	"context"
	"testing"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// mock implementation of KpiRepository
type mockKpiRepo struct {
	entries []*model.TimeTableEntry
	err     error
}

// GetTeamByUUID implements KpiRepository.
func (m *mockKpiRepo) GetTeamByUUID(teamID uuid.UUID) (*model.Team, error) {
	panic("unimplemented")
}

// GetTeams implements KpiRepository.
func (m *mockKpiRepo) GetTeams() ([]*model.Team, error) {
	panic("unimplemented")
}

var layoutISOs = "2024-01-10"
var dater = "2024-01-01"

func (m *mockKpiRepo) GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error) {
	return m.entries, m.err
}

// mustParseDayHour kept simple here; not used in the final test but handy if needed later
func mustParseDayHour(day string, h, min int) time.Time {
	loc := time.Local
	t, _ := time.ParseInLocation("2006-01-02 15:04", day+" "+
		time.Date(2006, 1, 2, h, min, 0, 0, loc).Format("15:04"), loc)
	return t
}

func TestKpiServiceGetUserKpiSummaryBusinessAggregation(t *testing.T) {
	day1 := layoutISOs
	day2 := "2024-01-11"

	u := &model.User{ID: uuid.New().String()}

	a1 := time.Date(2024, 1, 10, 9, 0, 0, 0, time.Local)
	d1 := time.Date(2024, 1, 10, 17, 0, 0, 0, time.Local)
	a2 := time.Date(2024, 1, 11, 10, 30, 0, 0, time.Local)
	d2 := time.Date(2024, 1, 11, 18, 0, 0, 0, time.Local)

	repo := &mockKpiRepo{entries: []*model.TimeTableEntry{
		{UserID: u, Day: day1, Arrival: a1, Departure: &d1, Status: false},
		{UserID: u, Day: day2, Arrival: a2, Departure: &d2, Status: false},
	}}

	svc := NewKpiService(repo)
	uid := uuid.New()
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.Local)
	to := time.Date(2024, 1, 31, 23, 59, 59, 0, time.Local)

	got, err := svc.GetUserKpiSummary(context.Background(), &uid, from, to)
	assert.NoError(t, err)
	assert.NotNil(t, got)

	// Worked minutes: 480 + 450 = 930
	assert.Equal(t, int32(930), got.WorkedMinutes)
	// Expected minutes: 2 days * 7h = 840 -> overtime 90
	assert.Equal(t, int32(90), got.OvertimeMinutes)
	// Days present = 2
	assert.Equal(t, int32(2), got.DaysPresent)
	// Consecutive streak across two consecutive days
	assert.Equal(t, int32(2), got.CurrentStreakDays)
	// Punctuality: day1 (09:00) punctual, day2 (10:30) late -> 1/2
	assert.InDelta(t, 0.5, got.PunctualityRate, 1e-9)
	// No open entry today -> PresentNow false
	assert.False(t, got.PresentNow)

	// Daily points should be sorted and match minutes
	assert.Len(t, got.DailyWorked, 2)
	assert.Equal(t, day1, got.DailyWorked[0].Date)
	assert.Equal(t, int32(480), got.DailyWorked[0].Minutes)
	assert.Equal(t, day2, got.DailyWorked[1].Date)
	assert.Equal(t, int32(450), got.DailyWorked[1].Minutes)
}

func TestNormalizeWindow(t *testing.T) {
	now := time.Now()
	start, end := normalizeWindow(time.Time{}, time.Time{})
	// end should default near now; start should be ~30 days before
	assert.False(t, end.IsZero())
	assert.WithinDuration(t, now, end, time.Minute)
	assert.Equal(t, end.AddDate(0, 0, -30).Format(layoutISO), start.Format(layoutISO))

	// swap when start > end
	s, e := normalizeWindow(time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC), time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC))
	assert.Equal(t, dater, s.Format(layoutISO))
	assert.Equal(t, "2024-02-01", e.Format(layoutISO))
}

func TestAggregateDaily(t *testing.T) {
	today := "2024-01-15"
	a1 := time.Date(2024, 1, 15, 9, 0, 0, 0, time.UTC)
	d1 := time.Date(2024, 1, 15, 10, 0, 0, 0, time.UTC) // 60

	// ongoing entry counts minutes since arrival when status true; we make it yesterday to avoid PresentNow then set today to flip flag
	a2 := time.Date(2024, 1, 14, 9, 0, 0, 0, time.UTC)

	entries := []*model.TimeTableEntry{
		{Day: today, Arrival: a1, Departure: &d1, Status: false},
		{Day: today, Arrival: a1, Departure: &d1, Status: false}, // duplicate day to test accumulation
		{Day: today, Arrival: a1, Departure: &d1, Status: false},
		{Day: "2024-01-14", Arrival: a2, Departure: nil, Status: true},
	}
	worked, daily, presentNow, daySet := aggregateDaily(entries, today)
	// first three entries 3*60 = 180; ongoing adds >= minutes since 2024-01-14 09:00 (positive). We only assert lower bound.
	assert.GreaterOrEqual(t, worked, 180)
	assert.Equal(t, 2, len(daySet))
	assert.False(t, presentNow)
	assert.Equal(t, int(180), daily[today])

	// If ongoing entry is today, presentNow must be true
	entries[3].Day = today
	entries[3].Arrival = time.Date(2024, 1, 15, 8, 0, 0, 0, time.UTC)
	_, _, presentNow2, _ := aggregateDaily(entries, today)
	assert.True(t, presentNow2)
}

func TestComputeStreak(t *testing.T) {
	daySet := map[string]struct{}{
		layoutISOs:   {},
		"2024-01-09": {},
		"2024-01-08": {},
		"2024-01-05": {},
	}
	s := computeStreak(daySet)
	assert.Equal(t, 3, s)

	assert.Equal(t, 0, computeStreak(map[string]struct{}{}))
}

func TestComputePunctuality(t *testing.T) {
	a1 := time.Date(2024, 1, 10, 9, 59, 59, 0, time.Local)
	a2 := time.Date(2024, 1, 10, 10, 0, 0, 0, time.Local)
	a3 := time.Date(2024, 1, 10, 10, 1, 0, 0, time.Local)
	e := []*model.TimeTableEntry{{Arrival: a1}, {Arrival: a2}, {Arrival: a3}}
	punctual, total := computePunctuality(e)
	assert.Equal(t, 2, punctual)
	assert.Equal(t, 3, total)
}

func TestBuildPoints(t *testing.T) {
	daily := map[string]int{layoutISOs: 60, dater: 30}
	pts := buildPoints(daily)
	assert.Equal(t, 2, len(pts))
	assert.Equal(t, dater, pts[0].Date)
	assert.Equal(t, int32(30), pts[0].Minutes)
	assert.Equal(t, layoutISOs, pts[1].Date)
	assert.Equal(t, int32(60), pts[1].Minutes)
}

func TestEffectiveDeparture(t *testing.T) {
	now := time.Now()
	dep := time.Date(2024, 1, 1, 10, 0, 0, 0, time.Local)
	// closed entry returns dep
	out := effectiveDeparture(&dep, false, now)
	assert.NotNil(t, out)
	assert.Equal(t, dep, *out)
	// ongoing returns now pointer
	out2 := effectiveDeparture(nil, true, now)
	assert.NotNil(t, out2)
	assert.WithinDuration(t, now, *out2, time.Millisecond)
	// nil if no dep and not status
	out3 := effectiveDeparture(nil, false, now)
	assert.Nil(t, out3)
}

func TestAddCoverageBucketsAndBuildCoveragePoints(t *testing.T) {
	counts := map[string]int{}
	arr := time.Date(2024, 1, 10, 9, 15, 0, 0, time.UTC)
	dep := time.Date(2024, 1, 10, 11, 45, 0, 0, time.UTC)
	start := time.Date(2024, 1, 10, 0, 0, 0, 0, time.UTC)
	end := time.Date(2024, 1, 10, 23, 59, 59, 0, time.UTC)
	addCoverageBuckets(counts, arr, dep, start, end)
	// Buckets for 09:00, 10:00, 11:00
	assert.Equal(t, 3, len(counts))
	cov := buildCoveragePoints(counts)
	assert.Equal(t, 3, len(cov))
	assert.Equal(t, int32(1), cov[0].Count)
}

func TestKpiServiceGetTeamKpiSummary(t *testing.T) {
	teamID := uuid.New()
	u1 := &model.User{ID: uuid.New().String()}
	u2 := &model.User{ID: uuid.New().String()}
	a1 := time.Date(2024, 1, 10, 9, 0, 0, 0, time.Local)
	d1 := time.Date(2024, 1, 10, 10, 0, 0, 0, time.Local)
	a2 := time.Now().Add(-30 * time.Minute)

	entries := []*model.TimeTableEntry{
		{UserID: u1, Arrival: a1, Departure: &d1, Status: false},
		{UserID: u2, Arrival: a2, Departure: nil, Status: true},
	}
	repo := &mockKpiRepo{entries: entries}
	svc := NewKpiService(repo)
	from := time.Now().Add(-time.Hour)
	to := time.Now().Add(time.Hour)
	out, err := svc.GetTeamKpiSummary(context.Background(), teamID, from, to)
	assert.NoError(t, err)
	assert.NotNil(t, out)
	// at least 60 minutes worked (the closed one)
	assert.GreaterOrEqual(t, int(out.TotalWorkedMinutes), 60)
	// 2 distinct users
	assert.GreaterOrEqual(t, out.AvgWorkedMinutesPerUser, 30.0)
	// one active user now
	assert.Equal(t, int32(1), out.ActiveUsers)
	// coverage non-empty
	assert.GreaterOrEqual(t, len(out.Coverage), 1)
}

func TestKpiServiceGetUserKpiSummaryRepoError(t *testing.T) {
	repo := &mockKpiRepo{entries: nil, err: assert.AnError}
	svc := NewKpiService(repo)
	uid := uuid.New()
	_, err := svc.GetUserKpiSummary(context.Background(), &uid, time.Time{}, time.Time{})
	assert.Error(t, err)
}

func TestKpiServiceGetTeamKpiSummaryRepoError(t *testing.T) {
	repo := &mockKpiRepo{err: assert.AnError}
	svc := NewKpiService(repo)
	_, err := svc.GetTeamKpiSummary(context.Background(), uuid.New(), time.Time{}, time.Time{})
	assert.Error(t, err)
}
