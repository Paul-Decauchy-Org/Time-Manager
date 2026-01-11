package database

import (
	"errors"
	"fmt"
	"log"
	"time"

	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"github.com/spf13/viper"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

type DBClient struct {
	DB *gorm.DB
}

func init() {
	// Configuration de Viper
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AddConfigPath(".")
	viper.AddConfigPath("..")

	// Valeurs par défaut
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_NAME", "timemanager")

	if err := viper.ReadInConfig(); err != nil {
		log.Println("Warning: .env file not found, using default values")
	}
}

func Connect() error {
	host := viper.GetString("DB_HOST")
	port := viper.GetString("DB_PORT")
	user := viper.GetString("DB_USER")
	password := viper.GetString("DB_PASSWORD")
	dbname := viper.GetString("DB_NAME")

	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return fmt.Errorf("failed to connect to database: %v", err)
	}

	// Configure connection pool
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to configure connection pool: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Println("Successfully connected to database")
	return nil
}

// MigrateDB exécute la migration des tables
func MigrateDB() error {
	if DB == nil {
		return errors.New("database connection not initialized")
	}

	// Migration séquentielle pour éviter les problèmes de références
	if err := DB.AutoMigrate(&dbmodels.User{}); err != nil {
		return fmt.Errorf("failed to migrate User table: %w", err)
	}
	if err := DB.AutoMigrate(&dbmodels.Team{}); err != nil {
		return fmt.Errorf("failed to migrate Team table: %w", err)
	}
	if err := DB.AutoMigrate(
		&dbmodels.TeamUser{},
		&dbmodels.TimeTableEntry{},
		&dbmodels.TimeTable{},
	); err != nil {
		return fmt.Errorf("failed to migrate related tables: %w", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

// SeedDB insère des données par défaut dans la base de données
func SeedDB() error {
	if DB == nil {
		return errors.New("database connection not initialized")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("adminpass"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	// Exemple: créer un utilisateur admin par défaut
	admin := dbmodels.User{
		ID:        uuid.New(),
		FirstName: "Admin",
		LastName:  "System",
		Email:     "admin@example.com",
		Password:  string(hashedPassword),
		Role:      dbmodels.RoleAdmin,
	}

	// Vérifier si l'utilisateur existe déjà
	var count int64
	DB.Model(&dbmodels.User{}).Where("email = ?", admin.Email).Count(&count)
	if count == 0 {
		if err := DB.Create(&admin).Error; err != nil {
			return fmt.Errorf("failed to seed admin user: %w", err)
		}
		log.Println("Seeded admin user")
	}

	// Ajouter d'autres données initiales ici si nécessaire

	log.Println("Database seeding completed successfully")
	return nil
}

// GetDB returns the database instance
func GetDB() (*gorm.DB, error) {
	if DB == nil {
		return nil, errors.New("database connection not initialized")
	}
	return DB, nil
}
