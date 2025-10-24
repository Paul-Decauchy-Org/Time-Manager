package teamUserMapper

import (
	"github.com/epitech/timemanager/internal/graph/model"
	teamMapper "github.com/epitech/timemanager/internal/mappers/team"
	userMapper "github.com/epitech/timemanager/internal/mappers/user"
	gmodel "github.com/epitech/timemanager/internal/models"
)

func DBTeamUserToGraph(tu *gmodel.TeamUser) *model.TeamUser {
	if tu == nil {
		return nil
	}

	result := &model.TeamUser{}
	if tu.User != nil {
		result.UserID = userMapper.DBUserToGraph(tu.User)
	} else {
		result.UserID = &model.User{ID: tu.UserID.String()}
	}

	if tu.Team != nil {
		result.TeamID = teamMapper.DBTeamToGraph(tu.Team)
	} else {
		result.TeamID = &model.Team{ID: tu.TeamID.String()}
	}

	return result
}

func DBTeamUsersToGraph(tus []*gmodel.TeamUser) []*model.TeamUser {
	result := make([]*model.TeamUser, len(tus))
	for i, tu := range tus {
		result[i] = DBTeamUserToGraph(tu)
	}
	return result
}
