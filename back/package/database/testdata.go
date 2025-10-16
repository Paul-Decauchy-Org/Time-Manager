package database

import (
	"log"
	"time"

	"github.com/google/uuid"
	dbmodels "github.com/epitech/timemanager/internal/models"
)

// SeedTestData insère un jeu de données de test complet dans la base de données
func SeedTestData() error {
	if DB == nil {
		return nil
	}

	log.Println("Seeding test data...")

	// Créer 5 utilisateurs (1 admin, 1 manager, 3 utilisateurs standards)
	users, err := createTestUsers()
	if err != nil {
		return err
	}

	// Créer 1 équipe avec le manager
	team, err := createTestTeam(users[1]) // Le manager est à l'index 1
	if err != nil {
		return err
	}

	// Ajouter 2 utilisateurs à l'équipe
	if err := addUsersToTeam(team, []*dbmodels.User{users[2], users[3]}); err != nil {
		return err
	}

	// Créer des entrées de pointage (TimeTableEntry) pour chaque utilisateur
	if err := createTestTimeTableEntries(users); err != nil {
		return err
	}

	// Créer des plannings (TimeTables) pour chaque utilisateur
	if err := createTestTimeTables(users); err != nil {
		return err
	}

	log.Println("Test data seeding completed successfully")
	return nil
}

// createTestUsers crée 5 utilisateurs avec différents rôles
func createTestUsers() ([]*dbmodels.User, error) {
	users := []*dbmodels.User{
		{
			ID:        uuid.New(),
			FirstName: "Admin",
			LastName:  "System",
			Email:     "admin@timemanager.com",
			Phone:     "+33123456789",
			Password:  "adminpass", // Dans un cas réel, utiliser un mot de passe hashé
			Role:      dbmodels.RoleAdmin,
		},
		{
			ID:        uuid.New(),
			FirstName: "Manager",
			LastName:  "Project",
			Email:     "manager@timemanager.com",
			Phone:     "+33234567890",
			Password:  "managerpass",
			Role:      dbmodels.RoleManager,
		},
		{
			ID:        uuid.New(),
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john.doe@timemanager.com",
			Phone:     "+33345678901",
			Password:  "johnpass",
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Jane",
			LastName:  "Smith",
			Email:     "jane.smith@timemanager.com",
			Phone:     "+33456789012",
			Password:  "janepass",
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Alice",
			LastName:  "Johnson",
			Email:     "alice.johnson@timemanager.com",
			Phone:     "+33567890123",
			Password:  "alicepass",
			Role:      dbmodels.RoleUser,
		},
	}

	// Vérifier si les utilisateurs existent déjà (par email)
	for _, user := range users {
		var count int64
		DB.Model(&dbmodels.User{}).Where("email = ?", user.Email).Count(&count)
		if count == 0 {
			if err := DB.Create(user).Error; err != nil {
				return nil, err
			}
		} else {
			// Si l'utilisateur existe, récupérer ses infos
			DB.Where("email = ?", user.Email).First(user)
		}
	}

	log.Printf("Created or retrieved %d test users", len(users))
	return users, nil
}

// createTestTeam crée une équipe avec un manager spécifié
func createTestTeam(manager *dbmodels.User) (*dbmodels.Team, error) {
	team := &dbmodels.Team{
		ID:          uuid.New(),
		Name:        "Development Team",
		Description: "Main development team for TimeManager project",
		ManagerID:   manager.ID,
	}

	// Vérifier si l'équipe existe déjà
	var count int64
	DB.Model(&dbmodels.Team{}).Where("name = ?", team.Name).Count(&count)
	if count == 0 {
		if err := DB.Create(team).Error; err != nil {
			return nil, err
		}
	} else {
		// Si l'équipe existe, récupérer ses infos
		DB.Where("name = ?", team.Name).First(team)
	}

	log.Printf("Created or retrieved team: %s", team.Name)
	return team, nil
}

// addUsersToTeam ajoute des utilisateurs à une équipe
func addUsersToTeam(team *dbmodels.Team, users []*dbmodels.User) error {
	for _, user := range users {
		// Vérifier si la relation existe déjà
		var count int64
		DB.Model(&dbmodels.TeamUser{}).
			Where("user_id = ? AND team_id = ?", user.ID, team.ID).
			Count(&count)

		if count == 0 {
			teamUser := &dbmodels.TeamUser{
				ID:     uuid.New(),
				UserID: user.ID,
				TeamID: team.ID,
			}
			if err := DB.Create(teamUser).Error; err != nil {
				return err
			}
		}
	}

	log.Printf("Added %d users to team %s", len(users), team.Name)
	return nil
}

// createTestTimeTableEntries crée des entrées de pointage pour les derniers 5 jours
func createTestTimeTableEntries(users []*dbmodels.User) error {
	now := time.Now()

	// Créer des entrées pour les 5 derniers jours
	for i := 0; i < 5; i++ {
		day := now.AddDate(0, 0, -i)
		dayStr := day.Format("2006-01-02")

		for _, user := range users {
			// Heures de travail: 9h-17h avec 1h de pause déjeuner
			arrival := time.Date(day.Year(), day.Month(), day.Day(), 9, 0, 0, 0, time.UTC)
			departure := time.Date(day.Year(), day.Month(), day.Day(), 17, 0, 0, 0, time.UTC)

			// Vérifier si l'entrée existe déjà
			var count int64
			DB.Model(&dbmodels.TimeTableEntry{}).
				Where("user_id = ? AND day = ?", user.ID, dayStr).
				Count(&count)

			if count == 0 {
				entry := &dbmodels.TimeTableEntry{
					ID:        uuid.New(),
					UserID:    user.ID,
					Day:       dayStr,
					Arrival:   arrival,
					Departure: departure,
					Status:    true, // Présent
				}
				if err := DB.Create(entry).Error; err != nil {
					return err
				}
			}
		}
	}

	log.Printf("Created time entries for %d users over 5 days", len(users))
	return nil
}

// createTestTimeTables crée des plannings pour la semaine en cours et la suivante
func createTestTimeTables(users []*dbmodels.User) error {
	now := time.Now()
	startOfWeek := now.AddDate(0, 0, -int(now.Weekday()))

	// Créer des plannings pour 2 semaines (courante + suivante)
	for weekOffset := 0; weekOffset < 2; weekOffset++ {
		// Pour chaque jour de la semaine (lundi-vendredi)
		for dayOffset := 0; dayOffset < 5; dayOffset++ {
			day := startOfWeek.AddDate(0, 0, dayOffset+weekOffset*7)
			dayStr := day.Format("2006-01-02")

			for _, user := range users {
				// Planning standard: 8h30-17h30
				start := time.Date(day.Year(), day.Month(), day.Day(), 8, 30, 0, 0, time.UTC)
				end := time.Date(day.Year(), day.Month(), day.Day(), 17, 30, 0, 0, time.UTC)

				// Vérifier si le planning existe déjà
				var count int64
				DB.Model(&dbmodels.TimeTable{}).
					Where("user_id = ? AND day = ?", user.ID, dayStr).
					Count(&count)

				if count == 0 {
					timeTable := &dbmodels.TimeTable{
						ID:     uuid.New(),
						UserID: user.ID,
						Day:    dbmodels.DAY(dayStr),
						Start:  start,
						Ends:   end,
					}
					if err := DB.Create(timeTable).Error; err != nil {
						return err
					}
				}
			}
		}
	}

	log.Printf("Created time tables for %d users over 2 weeks", len(users))
	return nil
}