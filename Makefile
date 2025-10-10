.PHONY: up down logs clean restart dev

up:
	docker compose up back database --build --wait

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

logs-front:
	docker compose logs -f front

clean:
	docker compose down -v
	docker system prune -f

reset-db:
	docker compose down -v database
	docker compose up database --build --wait