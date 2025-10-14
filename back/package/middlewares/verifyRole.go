package middlewares

import (
	"context"
	"errors"
)

func VerifyAdmin(ctx context.Context) error {
	role, ok := ctx.Value(ContextUserERoleKey).(string)
	if !ok {
		return errors.New("failed to get role")
	}
	if role != "ADMIN" {
		return errors.New("forbidden: admin access required")
	}
	return nil
}

func VerifyManager(ctx context.Context) error {
	role, ok := ctx.Value(ContextUserERoleKey).(string)
	if !ok {
		return errors.New("failed to get role")
	}
	if role != "MANAGER" {
		return errors.New("forbidden: admin access required")
	}
	return nil
}