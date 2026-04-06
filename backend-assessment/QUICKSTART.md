# 🚀 Quick Start Guide

Get the Backend Assessment running in 5 minutes.

---

## Prerequisites

- Node.js 18+
- Docker & Docker Compose

---

## Step 1: Start Database

```bash
docker-compose up -d postgres
```

---

## Step 2: Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Install dependencies
npm install
cd packages/prisma && npm install && cd ../..
cd apps/user-service && npm install && cd ../..
cd apps/wallet-service && npm install && cd ../..
```

---

## Step 3: Database Setup

```bash
cd packages/prisma
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

---

## Step 4: Start Services

**Terminal 1 - User Service:**
```bash
cd apps/user-service
npm run start:dev
```

**Terminal 2 - Wallet Service:**
```bash
cd apps/wallet-service
npm run start:dev
```

---

## Step 5: Test

```bash
node examples/test-client.js
```

---

## Expected Output

### User Service Startup
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║     ██╗  ██╗███████╗██╗   ██╗███████╗████████╗██████╗  ██╗                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝

✨ Features Enabled:
   🔐 gRPC Communication
   ⚡ Prisma ORM Integration
   📊 Structured Logging (Pino)
   🔍 Input Validation (class-validator)
   ✅ Interview Mode Security
```

### Test Results
```
📊 TEST SUMMARY

Total Tests: 8
Passed: 8
Failed: 0

🎉 All tests passed! 🎉
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -i :50051` then `kill -9 <PID>` |
| DB connection failed | `docker-compose up -d postgres` |
| Prisma error | `cd packages/prisma && npx prisma generate` |

---

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for code patterns
- Check [SECURITY_README.md](SECURITY_README.md) for IP protection info
- Explore the code in `apps/` and `packages/`

---

**You're all set! 🎉**
