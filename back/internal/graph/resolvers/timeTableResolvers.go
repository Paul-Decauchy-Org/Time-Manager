package resolvers

import (
	"context"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/package/middlewares"
)

func (r *queryResolver) TimeTableEntries(ctx context.Context) ([]*model.TimeTableEntry, error) {
	if err := middlewares.VerifyRole(ctx, "ADMIN", "MANAGER", "USER"); err != nil {
		return nil, err
	}
	return r.TimeTableService.GetTimeTableEntries()
}
