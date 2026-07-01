.DEFAULT_GOAL := help
COMPOSE := docker compose

.PHONY: help up down build logs migrate seed ps backend-test frontend-build clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

up: ## Build and start the full stack (db, redis, backend, frontend)
	$(COMPOSE) up --build -d
	@echo "Frontend  -> http://localhost:3000"
	@echo "API       -> http://localhost:8080"
	@echo "Run 'make seed' to load demo content."

down: ## Stop the stack
	$(COMPOSE) down

build: ## Build all images
	$(COMPOSE) build

logs: ## Tail logs from all services
	$(COMPOSE) logs -f

ps: ## Show running services
	$(COMPOSE) ps

migrate: ## Apply DB migrations (the API runs them automatically on boot; this forces a run)
	$(COMPOSE) up -d db
	$(COMPOSE) run --rm --entrypoint /app/seed backend
	@echo "Schema is up to date (the seed binary applies migrations before seeding)."

seed: ## Load demo content (idempotent)
	$(COMPOSE) run --rm --entrypoint /app/seed backend

backend-test: ## Run Go tests
	cd backend && go test ./...

frontend-build: ## Build the Next.js frontend locally
	cd frontend && npm run build

clean: ## Stop the stack and remove volumes
	$(COMPOSE) down -v
