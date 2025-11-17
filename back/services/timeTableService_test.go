package services

import (
    "testing"
    "time"

    "github.com/epitech/timemanager/internal/graph/model"
    "github.com/google/uuid"
    "github.com/stretchr/testify/assert"
)

type mockTTRepo struct {
    entries []*model.TimeTableEntry
    filtered []*model.TimeTableEntry
    err error
}

func (m *mockTTRepo) GetTimeTableEntries() ([]*model.TimeTableEntry, error) { return m.entries, m.err }
func (m *mockTTRepo) GetTimeTableEntriesFiltered(userID *uuid.UUID, teamID *uuid.UUID, from, to *time.Time) ([]*model.TimeTableEntry, error) {
    return m.filtered, m.err
}

func TestTimeTableServiceGetAll(t *testing.T) {
    repo := &mockTTRepo{entries: []*model.TimeTableEntry{{ID: "1"}}}
    svc := NewTimeTableService(repo)
    got, err := svc.GetTimeTableEntries()
    assert.NoError(t, err)
    assert.Len(t, got, 1)
}

func TestTimeTableServiceFiltered(t *testing.T) {
    now := time.Now()
    repo := &mockTTRepo{filtered: []*model.TimeTableEntry{{ID: "2"}}}
    svc := NewTimeTableService(repo)
    uid := uuid.New()
    tid := uuid.New()
    got, err := svc.GetTimeTableEntriesFiltered(&uid, &tid, &now, &now)
    assert.NoError(t, err)
    assert.Len(t, got, 1)
}
