package database

import (
	"log"
	"time"

	dbmodels "github.com/epitech/timemanager/internal/models"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// SeedTestData insère des données de test dans la base de données
func SeedTestData() error {
	log.Println("🌱 Starting database seeding...")

	// 1. Créer les utilisateurs
	users, err := createTestUsers()
	if err != nil {
		return err
	}
	log.Printf("✅ Created %d users", len(users))

	// 2. Créer les équipes
	teams, err := createTestTeams(users)
	if err != nil {
		return err
	}
	log.Printf("✅ Created %d teams", len(teams))

	// 3. Ajouter des membres aux équipes
	err = createTestTeamMembers(users, teams)
	if err != nil {
		return err
	}
	log.Println("✅ Added team members")

	// 4. Créer des entrées de pointage
	err = createTestTimeTableEntries(users)
	if err != nil {
		return err
	}
	log.Println("✅ Created time table entries")

	log.Println("🎉 Database seeding completed successfully!")
	return nil
}

// createTestUsers crée des utilisateurs de test avec différents rôles
func createTestUsers() ([]*dbmodels.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	users := []*dbmodels.User{
		// Admin
		{
			ID:        uuid.New(),
			FirstName: "Admin",
			LastName:  "Système",
			Email:     "admin@test.fr",
			Phone:     "0601020304",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleAdmin,
		},
		// Managers
		{
			ID:        uuid.New(),
			FirstName: "Jean",
			LastName:  "Dupont",
			Email:     "manager@test.fr",
			Phone:     "0602030405",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleManager,
		},
		{
			ID:        uuid.New(),
			FirstName: "Marie",
			LastName:  "Martin",
			Email:     "marie.martin@test.fr",
			Phone:     "0603040506",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleManager,
		},
		// Users
		{
			ID:        uuid.New(),
			FirstName: "Pierre",
			LastName:  "Dubois",
			Email:     "user@test.fr",
			Phone:     "0604050607",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Sophie",
			LastName:  "Bernard",
			Email:     "sophie.bernard@test.fr",
			Phone:     "0605060708",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Luc",
			LastName:  "Petit",
			Email:     "luc.petit@test.fr",
			Phone:     "0606070809",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Claire",
			LastName:  "Robert",
			Email:     "claire.robert@test.fr",
			Phone:     "0607080910",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Thomas",
			LastName:  "Richard",
			Email:     "thomas.richard@test.fr",
			Phone:     "0608091011",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Emma",
			LastName:  "Moreau",
			Email:     "emma.moreau@test.fr",
			Phone:     "0609101112",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
		{
			ID:        uuid.New(),
			FirstName: "Alexandre",
			LastName:  "Simon",
			Email:     "alex.simon@test.fr",
			Phone:     "0610111213",
			Password:  string(hashedPassword),
			Role:      dbmodels.RoleUser,
		},
	}

	// Insérer en batch
	if err := DB.Create(&users).Error; err != nil {
		return nil, err
	}

	return users, nil
}

// createTestTeams crée des équipes de test
func createTestTeams(users []*dbmodels.User) ([]*dbmodels.Team, error) {
	// Trouver les managers (indices 1 et 2)
	manager1 := users[1] // Jean Dupont
	manager2 := users[2] // Marie Martin

	teams := []*dbmodels.Team{
		{
			ID:          uuid.New(),
			Name:        "Équipe Développement Frontend",
			Description: "Équipe en charge du développement des interfaces utilisateur",
			ManagerID:   manager1.ID,
		},
		{
			ID:          uuid.New(),
			Name:        "Équipe Développement Backend",
			Description: "Équipe en charge de l'API et des services backend",
			ManagerID:   manager1.ID,
		},
		{
			ID:          uuid.New(),
			Name:        "Équipe DevOps",
			Description: "Équipe en charge de l'infrastructure et du déploiement",
			ManagerID:   manager2.ID,
		},
		{
			ID:          uuid.New(),
			Name:        "Équipe QA",
			Description: "Équipe en charge des tests et de la qualité",
			ManagerID:   manager2.ID,
		},
	}

	if err := DB.Create(&teams).Error; err != nil {
		return nil, err
	}

	return teams, nil
}

// createTestTeamMembers ajoute des membres aux équipes
func createTestTeamMembers(users []*dbmodels.User, teams []*dbmodels.Team) error {
	// Équipe Frontend (team 0): Pierre, Sophie, Luc
	frontendMembers := []dbmodels.TeamUser{
		{TeamID: teams[0].ID, UserID: users[3].ID}, // Pierre
		{TeamID: teams[0].ID, UserID: users[4].ID}, // Sophie
		{TeamID: teams[0].ID, UserID: users[5].ID}, // Luc
	}

	// Équipe Backend (team 1): Claire, Thomas
	backendMembers := []dbmodels.TeamUser{
		{TeamID: teams[1].ID, UserID: users[6].ID}, // Claire
		{TeamID: teams[1].ID, UserID: users[7].ID}, // Thomas
	}

	// Équipe DevOps (team 2): Emma, Alexandre
	devopsMembers := []dbmodels.TeamUser{
		{TeamID: teams[2].ID, UserID: users[8].ID}, // Emma
		{TeamID: teams[2].ID, UserID: users[9].ID}, // Alexandre
	}

	// Équipe QA (team 3): Pierre (aussi dans Frontend), Sophie (aussi dans Frontend)
	qaMembers := []dbmodels.TeamUser{
		{TeamID: teams[3].ID, UserID: users[3].ID}, // Pierre
		{TeamID: teams[3].ID, UserID: users[4].ID}, // Sophie
	}

	allMembers := append(frontendMembers, backendMembers...)
	allMembers = append(allMembers, devopsMembers...)
	allMembers = append(allMembers, qaMembers...)

	if err := DB.Create(&allMembers).Error; err != nil {
		return err
	}

	return nil
}

// createTestTimeTableEntries crée des entrées de pointage pour simuler la présence
func createTestTimeTableEntries(users []*dbmodels.User) error {
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local)

	var entries []*dbmodels.TimeTable

	// Pour chaque utilisateur (sauf admin et managers)
	for i := 3; i < len(users); i++ {
		user := users[i]

		// Créer des entrées pour les 7 derniers jours
		for day := 0; day < 7; day++ {
			date := today.AddDate(0, 0, -day)

			// Morning session (9h-12h)
			morningStart := date.Add(9 * time.Hour)
			morningEnd := date.Add(12 * time.Hour)

			// Afternoon session (14h-18h)
			afternoonStart := date.Add(14 * time.Hour)
			afternoonEnd := date.Add(18 * time.Hour)

			// Certains utilisateurs ont des horaires variables
			if i%2 == 0 {
				morningStart = morningStart.Add(time.Duration(i*10) * time.Minute)
				afternoonEnd = afternoonEnd.Add(-time.Duration(i*15) * time.Minute)
			}

			// Ajouter les entrées du matin
			entries = append(entries, &dbmodels.TimeTable{
				ID:     uuid.New(),
				UserID: user.ID,
				Start:  morningStart,
				Ends:   morningEnd,
			})

			// Ajouter les entrées de l'après-midi (sauf le vendredi après-midi pour certains)
			if date.Weekday() != time.Friday || i%3 != 0 {
				entries = append(entries, &dbmodels.TimeTable{
					ID:     uuid.New(),
					UserID: user.ID,
					Start:  afternoonStart,
					Ends:   afternoonEnd,
				})
			}
		}

		// Ajouter une entrée "en cours" pour aujourd'hui pour certains utilisateurs
		if i%2 == 0 && now.Hour() >= 9 && now.Hour() < 18 {
			entries = append(entries, &dbmodels.TimeTable{
				ID:     uuid.New(),
				UserID: user.ID,
				Start:  today.Add(9 * time.Hour),
				Ends:   now, // En cours
			})
		}
	}

	// Insérer en batch
	if err := DB.Create(&entries).Error; err != nil {
		return err
	}

	return nil
}

// ClearTestData supprime toutes les données de test
func ClearTestData() error {
	log.Println("🧹 Clearing test data...")

	// Supprimer dans l'ordre inverse des dépendances
	if err := DB.Exec("DELETE FROM team_users").Error; err != nil {
		return err
	}

	if err := DB.Exec("DELETE FROM time_tables").Error; err != nil {
		return err
	}

	if err := DB.Exec("DELETE FROM teams").Error; err != nil {
		return err
	}

	if err := DB.Exec("DELETE FROM users").Error; err != nil {
		return err
	}

	log.Println("✅ Test data cleared")
	return nil
}
