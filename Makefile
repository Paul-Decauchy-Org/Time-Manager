.PHONY: up down logs clean restart dev

up:
	docker compose up back database nginx sonarQube --build --wait

dev:
	docker compose up --build

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

logs-back:
	docker compose logs -f back

logs-db:
	docker compose logs -f database

logs-nginx:
	docker compose logs -f nginx

logs-sonar:
	docker compose logs -f sonarQube

logs-front:
	docker compose logs -f front

clean:
	docker compose down -v
	docker system prune -f

reset-db:
	docker compose down -v database
	docker compose up database --build --wait

# --- Tests & Coverage ---
.PHONY: back-test back-coverage sonar-back sonar-front

back-test:
	@echo Running Go tests...
	cd back; go test ./...

back-coverage:
	@echo Generating Go coverage profile at back/coverage
	cd back; go test ./... -coverprofile=coverage -covermode=atomic

sonar-back:
	@echo Scanning backend with SonarQube config in back/sonar-project.properties
	cd back; sonar-scanner

sonar-front:
	@echo Scanning frontend with SonarQube config in front/sonar-project.properties
	cd front; npm run sonar