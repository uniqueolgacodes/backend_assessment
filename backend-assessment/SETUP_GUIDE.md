# 📖 Setup Guide

Complete step-by-step guide to set up and run the Backend Assessment project.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Setup (Automated)](#quick-setup-automated)
3. [Manual Setup](#manual-setup)
4. [Running Services](#running-services)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Included with Node.js |
| Docker | Latest | [docker.com](https://docker.com/) |
| Docker Compose | Latest | Included with Docker Desktop |

### Verify Installation

```bash
# Check Node.js
node --version  # Should be v18.x.x or higher

# Check npm
npm --version   # Should be 9.x.x or higher

# Check Docker
docker --version
docker-compose --version
```

---

## Quick Setup (Automated)

The fastest way to get started:

```bash
# 1. Navigate to project directory
cd backend-assessment

# 2. Run automated setup
chmod +x setup.sh
./setup.sh
```

This script will:
- ✅ Verify prerequisites
- ✅ Start PostgreSQL container
- ✅ Install all dependencies
- ✅ Create `.env` file
- ✅ Run database migrations
- ✅ Generate Prisma client
- ✅ Build shared packages

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                        🎉 Setup Complete! 🎉                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

📚 Next Steps:

1. Start the User Service:
   cd apps/user-service && npm run start:dev

2. In a new terminal, start the Wallet Service:
   cd apps/wallet-service && npm run start:dev

3. Test the services:
   node examples/test-client.js
```

---

## Manual Setup

If you prefer manual control or the automated script fails:

### Step 1: Start PostgreSQL

```bash
# Start PostgreSQL container
docker-compose up -d postgres

# Verify it's running
docker ps | grep assessment-postgres

# Check logs (optional)
docker logs assessment-postgres
```

### Step 2: Install Dependencies

```bash
# Root dependencies
npm install

# Security package
cd packages/security
npm install
npm run build
cd ../..

# Proto package
cd packages/proto
npm install
cd ../..

# Prisma package
cd packages/prisma
npm install
cd ../..

# User service
cd apps/user-service
npm install
cd ../..

# Wallet service
cd apps/wallet-service
npm install
cd ../..
```

### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit if needed (default values work for local development)
nano .env
```

### Step 4: Database Setup

```bash
cd packages/prisma

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# (Optional) Open Prisma Studio
npx prisma studio
cd ../..
```

---

## Running Services

### Terminal 1: User Service

```bash
cd apps/user-service
npm run start:dev
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║     ██╗  ██╗███████╗██╗   ██╗███████╗████████╗██████╗  ██╗                  ║
║     ██║ ██╔╝██╔════╝██║   ██║██╔════╝╚══██╔══╝╚════██╗███║                  ║
║     █████╔╝ █████╗  ██║   ██║███████╗   ██║    █████╔╝╚██║                  ║
║     ██╔═██╗ ██╔══╝  ██║   ██║╚════██║   ██║    ╚═══██╗ ██║                  ║
║     ██║  ██╗███████╗╚██████╔╝███████║   ██║   ██████╔╝ ██║                  ║
║     ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═════╝  ╚═╝                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

[Nest] 12345  - 01/15/2024, 10:30:00 AM     LOG 🚀 Bootstrap
[Nest] 12345  - 01/15/2024, 10:30:00 AM     LOG gRPC Server running on port 50051
```

### Terminal 2: Wallet Service

```bash
cd apps/wallet-service
npm run start:dev
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  💰 WALLET SERVICE                                                            ║
║     Handles balances and transactions                                         ║
╚═══════════════════════════════════════════════════════════════════════════════╝

[Nest] 12346  - 01/15/2024, 10:30:05 AM     LOG 🚀 Bootstrap
[Nest] 12346  - 01/15/2024, 10:30:05 AM     LOG gRPC Server running on port 50052
```

---

## Testing

### Automated Test Suite

```bash
# Run all tests
node examples/test-client.js
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                   🧪 gRPC TEST CLIENT 🧪                                      ║
║         Backend Assessment - Automated Testing Suite                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

TEST 1: Create User
✅ User created: test.user@example.com (ID: abc-123)

TEST 2: Get User by ID
✅ User found: Test User

...

📊 TEST SUMMARY

Total Tests: 8
Passed: 8
Failed: 0

Pass Rate: 100.0%

🎉 All tests passed! 🎉
```

### Manual Testing with grpcurl

```bash
# Install grpcurl first
brew install grpcurl  # macOS

# Create a user
grpcurl -plaintext \
  -d '{"email": "test@example.com", "name": "Test User"}' \
  localhost:50051 \
  user.UserService/CreateUser

# Credit wallet (replace USER_ID with actual ID)
grpcurl -plaintext \
  -d '{"userId": "USER_ID", "amount": 100}' \
  localhost:50052 \
  wallet.WalletService/CreditWallet
```

See [examples/curl-examples.md](examples/curl-examples.md) for more examples.

---

## Troubleshooting

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::50051
```

**Solution:**
```bash
# Find process using port
lsof -i :50051

# Kill the process
kill -9 <PID>

# Or use different port in .env
USER_SERVICE_GRPC_PORT=50053
```

### Issue: Database Connection Failed

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker logs assessment-postgres

# Verify DATABASE_URL in .env
```

### Issue: Prisma Client Not Generated

**Error:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
cd packages/prisma
npx prisma generate
cd ../..
```

### Issue: Proto Files Not Found

**Error:**
```
Error: Proto file not found
```

**Solution:**
```bash
# Ensure proto files exist
ls packages/proto/proto/

# Should show: user.proto, wallet.proto
```

### Issue: Permission Denied on setup.sh

**Error:**
```
bash: ./setup.sh: Permission denied
```

**Solution:**
```bash
chmod +x setup.sh
./setup.sh
```

### Issue: Node Version Too Old

**Error:**
```
error: @nestjs/common@10.x.x: The engine "node" is incompatible
```

**Solution:**
```bash
# Install nvm (if not already installed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 18
nvm install 18
nvm use 18

# Verify
node --version
```

---

## Useful Commands

### Database

```bash
# Reset database (WARNING: Deletes all data!)
cd packages/prisma
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Create new migration
npx prisma migrate dev --name <migration_name>
```

### Docker

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f postgres

# Remove volumes (WARNING: Deletes data!)
docker-compose down -v
```

### Services

```bash
# Start user service in production mode
cd apps/user-service
npm run start:prod

# Start wallet service with debugging
cd apps/wallet-service
npm run start:debug

# Run tests
cd apps/user-service && npm test
cd apps/wallet-service && npm test
```

---

## Next Steps

Once everything is running:

1. **Explore the Code**
   - Review service implementations in `apps/`
   - Check proto definitions in `packages/proto/`
   - Examine database schema in `packages/prisma/`

2. **Read Documentation**
   - [ARCHITECTURE.md](ARCHITECTURE.md) - Code patterns and design
   - [SECURITY_README.md](SECURITY_README.md) - IP protection info

3. **Extend the Project**
   - Add new gRPC endpoints
   - Implement additional validation
   - Add metrics and monitoring

---

<p align="center">
  Need help? Check the <a href="README.md">README</a> or <a href="ARCHITECTURE.md">Architecture Guide</a>
</p>
