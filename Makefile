all: run

re: clean run

run :
	@echo "Building and running the app"
	docker compose up --build

down :
	@echo "Stopping the app"
	docker compose down --rmi all --volumes

clean: down
	@echo "Cleaning up"
	docker system prune -af
	rm -rf ./frontend/node_modules

.PHONY: all setup run down