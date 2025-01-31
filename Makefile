all: run

re: down run

run :
	@echo "Building and running the app"
	# mkdir ./frontend/build
	# mkdir ./backend/src
	docker compose up --build

down :
	@echo "Stopping the app"
	docker compose down

clean: down
	@echo "Cleaning up"
	docker system prune -af

cleandb:
	@echo "Wiping DB"
	docker volume rm db_data

.PHONY: all setup run down