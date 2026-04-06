# Backend Assessment - Makefile
# Quick commands for common operations

.PHONY: help setup install db-start db-stop db-migrate db-studio start-user start-wallet test clean

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║              Backend Assessment - Available Commands           ║"
	@echo "╠════════════════════════════════════════════════════════════════╣"
	@echo "║  make setup         - Run automated setup                      ║"
	@echo "║  make install       - Install all dependencies                 ║"
	@echo "║  make db-start      - Start PostgreSQL container               ║"
	@echo "║  make db-stop       - Stop PostgreSQL container                ║"
	@echo "║  make db-migrate    - Run database migrations                  ║"
	@echo "║  make db-studio     - Open Prisma Studio                       ║"
	@echo "║  make start-user    - Start User Service                       ║"
	@echo "║  make start-wallet  - Start Wallet Service                     ║"
	@echo "║  make test          - Run automated tests                      ║"
	@echo "║  make clean         - Clean all build artifacts                ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"

# Setup
setup:
	@chmod +x setup.sh && ./setup.sh

# Install dependencies
install:
	@npm install
	@cd packages/security && npm install
	@cd packages/proto && npm install
	@cd packages/prisma && npm install
	@cd apps/user-service && npm install
	@cd apps/wallet-service && npm install

# Database operations
db-start:
	@docker-compose up -d postgres
	@echo "✅ PostgreSQL started on port 5432"

db-stop:
	@docker-compose down
	@echo "✅ PostgreSQL stopped"

db-migrate:
	@cd packages/prisma && npx prisma migrate dev

db-generate:
	@cd packages/prisma && npx prisma generate

db-studio:
	@cd packages/prisma && npx prisma studio

db-reset:
	@cd packages/prisma && npx prisma migrate reset --force

# Start services
start-user:
	@cd apps/user-service && npm run start:dev

start-wallet:
	@cd apps/wallet-service && npm run start:dev

# Testing
test:
	@node examples/test-client.js

test-user:
	@cd apps/user-service && npm test

test-wallet:
	@cd apps/wallet-service && npm test

# Build
build-packages:
	@cd packages/security && npm run build
	@cd packages/proto && npm run build

# Linting
lint-user:
	@cd apps/user-service && npm run lint

lint-wallet:
	@cd apps/wallet-service && npm run lint

# Clean
clean:
	@echo "🧹 Cleaning build artifacts..."
	@find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
	@find . -name 'dist' -type d -prune -exec rm -rf '{}' + 2>/dev/null || true
	@find . -name '.assessment-lock' -type f -delete 2>/dev/null || true
	@echo "✅ Clean complete"

# Docker cleanup
docker-clean:
	@docker-compose down -v
	@docker system prune -f

# Development mode (starts both services - requires tmux or similar)
dev:
	@echo "Starting both services..."
	@echo "Open two terminals and run:"
	@echo "  make start-user"
	@echo "  make start-wallet"
