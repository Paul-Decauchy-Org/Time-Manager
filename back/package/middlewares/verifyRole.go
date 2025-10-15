package middlewares

import (
	"slices"
	"context"
	"errors"
)

func VerifyRole(ctx context.Context, allowedRoles ...string) error {
	role, ok := ctx.Value(ContextUserERoleKey).(string)
	if !ok {
		return errors.New("failed to get role from context")
	}
	if slices.Contains(allowedRoles, role) {
			return nil 
	}
	return errors.New("forbidden: you don't have access")
}