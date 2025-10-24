package main

import (
	"flag"
	"log"

	"github.com/epitech/timemanager/package/database"
)

func main() {
	// Options CLI
	var (
		resetDB   bool
		seedDB    bool
		testData  bool
		migrateDB bool
	)

	flag.BoolVar(&resetDB, "reset", false, "Reset database by dropping all tables before migration")
	flag.BoolVar(&seedDB, "seed", false, "Seed database with default data")
	flag.BoolVar(&testData, "test-data", false, "Seed database with test data (5 users, 1 team, time entries, etc)")
	flag.BoolVar(&migrateDB, "migrate", true, "Migrate database schema")
	flag.Parse()

	// Se connecter à la base de données
	if err := database.Connect(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Si l'option reset est spécifiée, supprimer toutes les tables
	if resetDB {
		if err := dropAllTables(); err != nil {
			log.Fatalf("Failed to reset database: %v", err)
		}
		log.Println("Database reset completed")
	}

	// Exécuter la migration si demandé
	if migrateDB {
		log.Println("Starting database migration...")
		if err := database.MigrateDB(); err != nil {
			log.Fatalf("Migration failed: %v", err)
		}
		log.Println("Migration completed successfully")
	}

	// Seed de données par défaut si demandé
	if seedDB {
		log.Println("Starting database seeding...")
		if err := database.SeedDB(); err != nil {
			log.Fatalf("Seeding failed: %v", err)
		}
		log.Println("Seeding completed successfully")
	}

	// Seed de données de test si demandé
	if testData {
		log.Println("Starting test data seeding...")
		if err := database.SeedTestData(); err != nil {
			log.Fatalf("Test data seeding failed: %v", err)
		}
		log.Println("Test data seeding completed successfully")
	}

	log.Println("Database operations completed")
}

// dropAllTables supprime toutes les tables dans l'ordre correct pour éviter les erreurs de FK
func dropAllTables() error {
	db, err := database.GetDB()
	if err != nil {
		return err
	}

	log.Println("Dropping all tables...")

	// Désactiver temporairement les contraintes de clés étrangères pour PostgreSQL
	db.Exec("SET session_replication_role = 'replica';")

	// Liste des tables à supprimer dans l'ordre (des enfants aux parents)
	tablesToDrop := []string{
		"time_tables",
		"time_table_entries",
		"team_users",
		"teams",
		"users",
	}

	for _, tableName := range tablesToDrop {
		log.Printf("Dropping table %s", tableName)
		if err := db.Exec("DROP TABLE IF EXISTS " + tableName + " CASCADE").Error; err != nil {
			return err
		}
	}

	// Réactiver les contraintes
	db.Exec("SET session_replication_role = 'origin';")

	return nil
}
