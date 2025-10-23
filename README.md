<div align="center">

# ⏱️ Time-Manager

**Application de gestion du temps et des équipes** — Backend Go + Frontend Next.js

[![CI Status](https://github.com/PaulDecauchy/Time-Manager/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/PaulDecauchy/Time-Manager/actions/workflows/main.yml)
[![Go Version](https://img.shields.io/badge/Go-v1.25-blue)](https://go.dev/)
[![Node Version](https://img.shields.io/badge/Node-v20-green)](https://nodejs.org/)
[![Next.js Version](https://img.shields.io/badge/Next.js-v15-black)](https://nextjs.org/)
[![Release](https://img.shields.io/github/v/release/PaulDecauchy/Time-Manager?color=blue)](https://github.com/PaulDecauchy/Time-Manager/releases)
[![Codecov](https://img.shields.io/codecov/c/github/PaulDecauchy/Time-Manager)](https://codecov.io/gh/PaulDecauchy/Time-Manager)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Ready-blue)](docker-compose.yml)

</div>

## 🚀 Présentation

Time-Manager est une application complète de gestion du temps et des équipes. Elle permet aux utilisateurs de :

- Suivre les heures de travail (clock-in/clock-out)
- Gérer les équipes et membres
- Visualiser et analyser les données de temps
- Administrer les rôles et permissions

## 📁 Structure du projet

```
Time-Manager/
├── back/                 # Backend Go
│   ├── cmd/              # Points d'entrée (main.go, dbtools)
│   ├── internal/         # Code interne (graph, models, repos)
│   │   ├── graph/        # GraphQL schema et resolvers
│   │   ├── models/       # Modèles de données
│   │   └── repositories/ # Couche d'accès aux données
│   ├── services/         # Services métier
│   └── migrations/       # Migrations DB
├── front/                # Frontend Next.js
│   ├── app/              # Pages et routes Next.js
│   ├── components/       # Composants React
│   ├── apollo/           # Configuration Apollo Client
│   └── generated/        # Types GraphQL générés
├── init-db/              # Scripts SQL d'initialisation
├── docker-compose.yml    # Configuration Docker Compose
├── nginx/                # Configuration serveur web
└── .github/workflows/    # CI/CD pipelines
```

### 🔧 Technologies utilisées

#### Backend
- **Go** (v1.25+) - Langage principal
- **gqlgen** - Framework GraphQL
- **GORM** - ORM SQL
- **testify** - Framework de test

#### Frontend
- **Next.js** - Framework React
- **Apollo Client** - Client GraphQL
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling

## 🚀 Quickstart

### Prérequis
- **Go** >= 1.25
- **Node.js** >= 20
- **PostgreSQL** (ou Docker pour exécuter la base de données)
- **Git**

### Option 1: Docker Compose (recommandé)
La méthode la plus simple pour démarrer l'ensemble du stack:

```powershell
# Cloner le dépôt
git clone https://github.com/PaulDecauchy/Time-Manager.git
cd Time-Manager

# Démarrer tous les services
docker compose up -d
```

L'application sera disponible sur:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8084/query

### Option 2: Développement local

#### 1️⃣ Backend (Go)

```powershell
cd Time-Manager/back

# Installer les dépendances
go mod download

# Configurer l'environnement
cp .env.example .env
# Modifier .env avec vos paramètres de connexion DB

# Lancer l'application
go run ./cmd/main.go
```

**Initialisation de la base de données:**

```powershell
# Réinitialiser la DB et charger les données de test
go run cmd/dbtools/resetDB.go --reset --test-data

# Ou charger uniquement les données de test
go run cmd/dbtools/resetDB.go --test-data
```

#### 2️⃣ Frontend (Next.js)

```powershell
cd Time-Manager/front

# Installer les dépendances
npm ci

# Générer les types GraphQL
npm run codegen

# Lancer en mode développement
npm run dev
```

> 💡 **Note**: Si vous rencontrez des erreurs avec l'import `@/generated/graphql`, vérifiez que `front/tsconfig.json` contient les configurations `baseUrl` et `paths` correctes.

## 🧪 Tests et qualité de code

### Tests Backend (Go)

```powershell
cd Time-Manager/back

# Exécuter tous les tests
go test ./... -v

# Générer un rapport de couverture
go test ./... -coverprofile=coverage.out

# Afficher le rapport de couverture dans le navigateur
go tool cover -html=coverage.out
```

### Tests Frontend (Next.js)

```powershell
cd Time-Manager/front

# Installer les dépendances
npm ci

# Générer les types GraphQL
npm run codegen

# Vérifier le linting et formatage
npm run lint

# Build complet (inclut vérifications de types)
npm run build
```

### SonarQube (analyse statique)

```powershell
# Backend
cd Time-Manager/back
# Configuration dans sonar-project.properties
sonar-scanner

# Frontend
cd Time-Manager/front
npm run sonar
```

## ✨ Fonctionnalités principales

### Gestion du temps
- **Clock-in / Clock-out** - Enregistrement des heures de travail
- **Visualisation** - Graphiques et rapports de temps
- **Historique** - Consultation des entrées précédentes

### Gestion d'équipes
- **Création d'équipes** - Organisation des utilisateurs
- **Assignation de managers** - Hiérarchie et responsabilités
- **Statistiques d'équipe** - Vue consolidée par équipe

### Administration
- **Gestion des utilisateurs** - Création, modification, suppression
- **Gestion des rôles** - Attribution de permissions
- **Configuration système** - Paramètres globaux

## 🔄 CI/CD avec GitHub Actions

Notre pipeline CI/CD est défini dans `.github/workflows/main.yml` et exécute les étapes suivantes:

### Backend
- Setup Go 1.25
- Compilation du code Go
- Exécution des tests avec rapport de couverture

### Frontend
- Setup Node.js 20
- Installation des dépendances
- Génération des types GraphQL avec codegen
- Build Next.js

### Docker
- Build des images Docker
- Tests d'intégration (optionnel)

> ⚠️ **Note**: Si le job `build` dépend d'un job `lint` qui est commenté, vous devez soit supprimer `needs: [lint]`, soit réactiver le job `lint` pour éviter l'erreur `The workflow must contain at least one job with no dependencies`.

## 🛠️ Conseils pour le développement

### Tests unitaires du backend

Nous utilisons une architecture découplée avec interfaces pour faciliter les tests:

```go
// Définir une interface pour le repository
type AdminRepo interface {
    CreateUser(model.CreateUserInput) (*model.User, error)
    // autres méthodes...
}

// Dans les tests, créer un mock qui implémente cette interface
type MockAdminRepo struct {
    mock.Mock
}

func (m *MockAdminRepo) CreateUser(input model.CreateUserInput) (*model.User, error) {
    args := m.Called(input)
    return args.Get(0).(*model.User), args.Error(1)
}

// Test utilisant le mock
func TestAdminService_CreateUser(t *testing.T) {
    mockRepo := new(MockAdminRepo)
    svc := NewAdminService(mockRepo)
    
    input := model.CreateUserInput{Email: "test@example.com"}
    expected := &model.User{Email: "test@example.com"}
    
    // Définir le comportement attendu
    mockRepo.On("CreateUser", mock.Anything).Return(expected, nil)
    
    // Appeler la méthode du service
    got, err := svc.CreateUser(input)
    
    // Assertions
    assert.NoError(t, err)
    assert.Equal(t, expected, got)
    mockRepo.AssertExpectations(t)
}
```

### GraphQL Codegen

Pour que la génération de code GraphQL fonctionne:

1. Assurez-vous que `schema.graphql` est à jour (utiliser `npm run schema` avec le backend en cours d'exécution)
2. Vérifiez `codegen.ts` pour les chemins et configurations
3. Exécutez `npm run codegen` pour générer les types TypeScript
4. Dans CI, exécutez `codegen` avant `build`

## 👥 Contribution

Nous accueillons toutes les contributions! Voici comment participer:

1. **Fork** le dépôt
2. **Clone** votre fork: `git clone https://github.com/votre-username/Time-Manager.git`
3. **Créez une branche**: `git checkout -b feature/ma-super-feature`
4. **Commitez** vos changements: `git commit -am 'Ajout d'une super feature'`
5. **Poussez** vers la branche: `git push origin feature/ma-super-feature`
6. **Ouvrez une Pull Request**

### Bonnes pratiques
- Écrire des tests pour tout nouveau code
- Suivre les conventions de code du projet
- Mettre à jour la documentation si nécessaire

## 📄 License

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
    <p>Développé avec ❤️ par l'équipe Time-Manager</p>
    <p>© 2025 EPITECH Project</p>
</div>
