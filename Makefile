.DEFAULT_GOAL := help

# ==========================================
# Variables
# ==========================================
DOCKER_DEV_COMPOSE := docker compose -f docker-compose.dev.yml
DOCKER_PROD_COMPOSE := docker compose

# ==========================================
# Targets
# ==========================================

.PHONY: help
help: ## Muestra esta ayuda con todos los comandos disponibles
	@echo ""
	@echo "🛠️  Comandos disponibles para Base CRM (Next.js + Postgres + Cloudflare):"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""

# --- Modo Desarrollo (Dev) ---

.PHONY: dev
dev: ## Levanta todo el stack en modo desarrollo (Next.js dev + Postgres + Cloudflare)
	$(DOCKER_DEV_COMPOSE) up -d

.PHONY: dev-build
dev-build: ## Reconstruye y levanta todo en modo desarrollo
	$(DOCKER_DEV_COMPOSE) up -d --build

.PHONY: dev-down
dev-down: ## Detiene los contenedores de desarrollo
	$(DOCKER_DEV_COMPOSE) down

.PHONY: dev-logs
dev-logs: ## Sigue los logs en tiempo real del contenedor Next.js en desarrollo
	$(DOCKER_DEV_COMPOSE) logs -f web

.PHONY: dev-logs-all
dev-logs-all: ## Sigue los logs de todos los servicios de desarrollo
	$(DOCKER_DEV_COMPOSE) logs -f

# --- Modo Producción (Prod) ---

.PHONY: prod
prod: ## Compila y levanta la aplicación en modo producción standalone
	$(DOCKER_PROD_COMPOSE) up -d --build

.PHONY: prod-down
prod-down: ## Detiene los contenedores de producción
	$(DOCKER_PROD_COMPOSE) down

.PHONY: prod-logs
prod-logs: ## Sigue los logs en modo producción
	$(DOCKER_PROD_COMPOSE) logs -f

# --- Monitoreo y Utilidades ---

.PHONY: ps
ps: ## Muestra el estado de los contenedores
	@$(DOCKER_DEV_COMPOSE) ps

.PHONY: logs-cloudflared
logs-cloudflared: ## Sigue los logs del conector de Cloudflare Tunnel
	docker compose logs -f cloudflared

.PHONY: logs-db
logs-db: ## Sigue los logs de la base de datos PostgreSQL
	docker compose logs -f postgres

.PHONY: db-shell
db-shell: ## Abre la consola interactiva psql dentro del contenedor de PostgreSQL
	docker compose exec postgres psql -U streaming_crm -d streaming_crm

.PHONY: restart-web
restart-web: ## Reinicia únicamente el contenedor web (Next.js)
	$(DOCKER_DEV_COMPOSE) restart web

.PHONY: jobs
jobs: ## Ejecuta el worker de trabajos (bot:worker) dentro del contenedor web
	$(DOCKER_DEV_COMPOSE) exec web pnpm run bot:worker
