package dbmodels

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Role string

const (
	RoleUser    Role = "USER"
	RoleAdmin   Role = "ADMIN"
	RoleManager Role = "MANAGER"
)

type DAY string

type User struct {
	ID               uuid.UUID        `gorm:"primaryKey;type:uuid"`
	FirstName        string           `gorm:"type:text"`
	LastName         string           `gorm:"type:text"`
	Email            string           `gorm:"type:text;uniqueIndex"`
	Phone            string           `gorm:"type:text"`
	Password         string           `gorm:"type:text"`
	Role             Role             `gorm:"type:text"`
	Teams            []*Team          `gorm:"many2many:team_users;"`
	TimeTableEntries []TimeTableEntry `gorm:"foreignKey:UserID"`
	TimeTables       []TimeTable      `gorm:"foreignKey:UserID"`
}

type Team struct {
	ID          uuid.UUID `gorm:"primaryKey;type:uuid"`
	Name        string    `gorm:"type:text"`
	Description string    `gorm:"type:text"`
	ManagerID   uuid.UUID `gorm:"type:uuid;index"`
	Manager     *User     `gorm:"foreignKey:ManagerID;references:ID"`
	Users       []*User   `gorm:"many2many:team_users;"`
}

type TeamUser struct {
	UserID uuid.UUID `gorm:"primaryKey;type:uuid"`
	User   *User     `gorm:"foreignKey:UserID;references:ID"`
	TeamID uuid.UUID `gorm:"primaryKey;type:uuid"`
	Team   *Team     `gorm:"foreignKey:TeamID;references:ID"`
}

type TimeTableEntry struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid"`
	UserID    uuid.UUID `gorm:"type:uuid;index"`
	User      *User     `gorm:"foreignKey:UserID;references:ID"`
	Day       string    `gorm:"type:text"`
	Arrival   time.Time
	Departure time.Time
	Status    bool
}

type TimeTable struct {
	ID            uuid.UUID `gorm:"primaryKey;type:uuid"`
	Start         time.Time
	Ends          time.Time
	EffectiveFrom time.Time
	EffectiveTo   time.Time
	IsActive      bool
}

// Avant les hooks générer les UUIDs s'ils ne sont pas fournis
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return
}

func (t *Team) BeforeCreate(tx *gorm.DB) (err error) {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return
}

func (te *TimeTableEntry) BeforeCreate(tx *gorm.DB) (err error) {
	if te.ID == uuid.Nil {
		te.ID = uuid.New()
	}
	return
}

func (tt *TimeTable) BeforeCreate(tx *gorm.DB) (err error) {
	if tt.ID == uuid.Nil {
		tt.ID = uuid.New()
	}
	return
}
