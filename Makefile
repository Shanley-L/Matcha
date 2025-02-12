all: run

re: down run

run :
	@echo "Building and running the app"
	# mkdir ./frontend/build
	# mkdir ./backend/src
	docker compose up --build

down :
	@echo "Stopping the app"
	docker compose down -v

clean: down
	@echo "Cleaning up"
	docker system prune -af

cleandb:
	@echo "Wiping DB"
	docker volume rm db_data

test:
	@echo "Running tests 222"

.PHONY: all setup run down