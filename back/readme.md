# réinitialiser la base de données, migrer les tables, et ajouter les données de test
go run cmd/dbtools/resetDB.go --reset --test-data

# Ajouter uniquement les données de test sans réinitialiser
go run cmd/dbtools/resetDB.go --test-data