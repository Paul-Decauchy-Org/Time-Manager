package timetableEntryMutation

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/epitech/timemanager/internal/graph/model"
	"github.com/epitech/timemanager/internal/mappers/timeTableEntries"
	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/epitech/timemanager/package/middlewares"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func ClockIn(ctx context.Context, db *gorm.DB) (*model.TimeTableEntry, error) {
	userIDstr, ok := ctx.Value(middlewares.ContextUserIDKey).(string)
	if !ok || userIDstr == "" {
		return nil, errors.New("Unauthoriszed: user not authenticated")
	}

	userID, err := uuid.Parse(userIDstr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID in context: %v", err)
	}

	currentDate := time.Now().Format("2006-01-02")
	now := time.Now()

	var existingEntry dbmodels.TimeTableEntry
	result := db.Where("user_id = ? AND day = ?", userID, currentDate).First(&existingEntry)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			newEntry := dbmodels.TimeTableEntry{
				UserID:    userID,
				Day:       currentDate,
				Arrival:   now,
				Departure: time.Time{},
				Status:    true,
			}

			if err := db.Create(&newEntry).Error; err != nil {
				return nil, fmt.Errorf("failed to create time entry: %w", err)
			}
			checkPlannedHours(db, userID, now)

			return timeTableEntriesMapper.DBTimeTableEntryToGraph(&newEntry), nil
		}
		return nil, fmt.Errorf("database error: %w", result.Error)
	}

	if existingEntry.Status {
		return nil, errors.New("you are already clocked in")
	}

	existingEntry.Arrival = now
	existingEntry.Status = true
	existingEntry.Departure = time.Time{}

	if err := db.Save(&existingEntry).Error; err != nil {
		return nil, fmt.Errorf("failed to update time entry: %w", err)
	}

	// Vérification des heures planifiées (optionnel)
	checkPlannedHours(db, userID, now)

	return timeTableEntriesMapper.DBTimeTableEntryToGraph(&existingEntry), nil

}

func ClockOut(ctx context.Context, db *gorm.DB) (*model.TimeTableEntry, error) {
	userIDStr, ok := ctx.Value(middlewares.ContextUserIDKey).(string)
	if !ok || userIDStr == "" {
		return nil, errors.New("unauthorized: user not authenticated")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID format: %w", err)
	}

	currentDate := time.Now().Format("2006-01-02")
	now := time.Now()

	var existingEntry dbmodels.TimeTableEntry
	result := db.Where("user_id = ? AND day = ?", userID, currentDate).First(&existingEntry)

	if result.Error != nil {
		return nil, errors.New("no clock-in record found for today")
	}
	if !existingEntry.Status {
		return nil, errors.New("you are not clocked in")
	}

	existingEntry.Departure = now
	existingEntry.Status = false

	if err := db.Save(&existingEntry).Error; err != nil {
		return nil, fmt.Errorf("failed to update time entry: %w", err)
	}

	return timeTableEntriesMapper.DBTimeTableEntryToGraph(&existingEntry), nil

}

func checkPlannedHours(db *gorm.DB, userID uuid.UUID, now time.Time) {
	dayOfWeek := now.Weekday().String()
	var timeTable dbmodels.TimeTable
	if err := db.Where("user_id = ? AND day = ?", userID, dayOfWeek).First(&timeTable).Error; err == nil {
		plannedStart := timeTable.Start

		nowHour, nowMin := now.Hour(), now.Minute()
		plannedHour, plannedMin := plannedStart.Hour(), plannedStart.Minute()

		nowMinutes := nowHour*60 + nowMin
		plannedMinutes := plannedHour*60 + plannedMin

		if nowMinutes > plannedMinutes+15 { // 15 minutes de tolérance
			lateMinutes := nowMinutes - plannedMinutes
			fmt.Printf("User %s is late by %d minutes\n", userID, lateMinutes)
		}
	}
}
