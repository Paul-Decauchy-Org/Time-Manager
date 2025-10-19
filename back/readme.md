# réinitialiser la base de données, migrer les tables, et ajouter les données de test
go run cmd/dbtools/resetDB.go --reset --test-data

# Ajouter uniquement les données de test sans réinitialiser
go run cmd/dbtools/resetDB.go --test-data

<!-- cle sonar back: -->
sqp_4225d3ef1801f7a9de611a81d7886a5f40572aca