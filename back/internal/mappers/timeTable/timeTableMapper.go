package timeTableMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBTimeTableToGraph(t *gmodel.TimeTable) *model.TimeTable {
	if t == nil {
		return nil
	}
	return &model.TimeTable{
		ID:     t.ID.String(),
		Day:    model.Jour(t.Day),
		Start:  t.Start,
		End:    t.End,
	}
}

func DBTimeTablesToGraph(tables []*gmodel.TimeTable) []*model.TimeTable {
	out := make([]*model.TimeTable, 0, len(tables))
	for i := range tables {
		out = append(out, DBTimeTableToGraph(tables[i]))
	}
	return out
}
