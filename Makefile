.PHONY: up down logs clean

up:
	docker compose up back database --build --wait

down:
	docker compose down

logs:
	docker compose logs -f

clean:
	docker compose down -v