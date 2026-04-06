# 💼 Backend Engineer Technical Assessment

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![gRPC](https://img.shields.io/badge/gRPC-244c5a?style=flat&logo=grpc&logoColor=white)](https://grpc.io/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)

> A production-ready microservices architecture demonstrating gRPC communication, Prisma ORM, and enterprise-grade patterns.

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║   👤 User Service (Port 50051)  ←→  💰 Wallet Service (Port 50052)           ║
║                                                                               ║
║   • Create/Get Users            ←→  • Create/Get Wallet                      ║
║   • Email validation            ←→  • Credit/Debit Operations                ║
║   • Unique constraints          ←→  • Transaction History                    ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **Docker** & Docker Compose
- **npm** 9+

### One-Command Setup

```bash
# Clone and setup everything
./setup.sh
```

This will:
1. ✅ Check prerequisites
2. ✅ Start PostgreSQL container
3. ✅ Install all dependencies
4. ✅ Run database migrations
5. ✅ Build shared packages

### Start Services

```bash
# Terminal 1: Start User Service
cd apps/user-service && npm run start:dev

# Terminal 2: Start Wallet Service  
cd apps/wallet-service && npm run start:dev
```

### Test the Services

```bash
# Run automated tests
node examples/test-client.js
```

## 📁 Project Structure

```
backend-assessment/
├── 📄 README.md                 ← You are here!
├── 📄 PROJECT_SUMMARY.md        ← Quick overview & metrics
├── 📄 SETUP_GUIDE.md            ← Detailed setup instructions
├── 📄 ARCHITECTURE.md           ← Code quality & design patterns
├── 📄 SECURITY_README.md        ← IP protection explained
│
├── 🚀 apps/
│   ├── user-service/            ← Microservice 1 (Port 50051)
│   │   ├── src/
│   │   │   ├── user/
│   │   │   │   ├── user.controller.ts    # gRPC handlers
│   │   │   │   ├── user.service.ts       # Business logic
│   │   │   │   └── dto/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts                   # Entry point
│   │   └── package.json
│   │
│   └── wallet-service/          ← Microservice 2 (Port 50052)
│       ├── src/
│       │   ├── wallet/
│       │   │   ├── wallet.controller.ts  # gRPC handlers
│       │   │   └── wallet.service.ts     # Transaction logic
│       │   ├── common/
│       │   │   ├── user-client.module.ts # Inter-service client
│       │   │   └── user-client.service.ts
│       │   ├── app.module.ts
│       │   └── main.ts
│       └── package.json
│
├── 📦 packages/
│   ├── proto/                   ← gRPC definitions
│   │   ├── proto/user.proto
│   │   └── proto/wallet.proto
│   ├── prisma/                  ← Database schema
│   │   └── prisma/schema.prisma
│   └── security/                ← Interview mode guard
│       └── src/
│           ├── security.service.ts       # Time-bomb & validation
│           └── terminal-banner.ts        # Cool terminal output
│
├── 🧪 examples/
│   ├── test-client.js           ← Automated test suite
│   └── curl-examples.md         ← Manual testing guide
│
├── ⚙️  setup.sh                 ← Automated installer
├── 🐳 docker-compose.yml        ← PostgreSQL container
└── 🔧 package.json              ← Monorepo config
```

## 🎯 Features Implemented

### Core Requirements ✅

| Feature | Status | Location |
|---------|--------|----------|
| User Service (Create, Get) | ✅ | `apps/user-service/` |
| Wallet Service (Create, Get, Credit, Debit) | ✅ | `apps/wallet-service/` |
| gRPC Communication | ✅ | Proto files + Controllers |
| Inter-Service Calls | ✅ | `user-client.service.ts` |
| PostgreSQL + Prisma | ✅ | `packages/prisma/` |
| Database Migrations | ✅ | `prisma/migrations/` |

### Bonus Points ✅

| Feature | Implementation |
|---------|---------------|
| **Transactions** | Prisma `$transaction` for atomic credit/debit |
| **Validation** | `class-validator` with DTOs |
| **Error Handling** | Custom RPC exceptions with proper gRPC status codes |
| **Logging** | `nestjs-pino` with structured JSON logging |

### Extra Polish ✨

- 🎨 **Terminal Banners** - Cool ASCII art on service startup
- 🔒 **Security Layer** - Interview mode protection (see SECURITY_README.md)
- 🧪 **Test Client** - Automated testing suite
- 📚 **Documentation** - Comprehensive guides

## 🔌 API Reference

### User Service (Port 50051)

| Method | Request | Response |
|--------|---------|----------|
| `CreateUser` | `{email, name}` | `{id, email, name, createdAt, success, message}` |
| `GetUserById` | `{id}` | `{id, email, name, createdAt, exists, message}` |

### Wallet Service (Port 50052)

| Method | Request | Response |
|--------|---------|----------|
| `CreateWallet` | `{userId}` | `{id, userId, balance, createdAt, success, message}` |
| `GetWallet` | `{userId}` | `{id, userId, balance, createdAt, exists, message}` |
| `CreditWallet` | `{userId, amount, description?}` | `{id, userId, newBalance, creditedAmount, success, message, transactionId}` |
| `DebitWallet` | `{userId, amount, description?}` | `{id, userId, newBalance, debitedAmount, success, message, transactionId}` |

## 🧪 Testing

### Automated Tests

```bash
node examples/test-client.js
```

Runs 8 comprehensive tests:
1. ✅ Create User
2. ✅ Get User by ID
3. ✅ Create Wallet
4. ✅ Get Wallet
5. ✅ Credit Wallet
6. ✅ Debit Wallet
7. ✅ Insufficient Balance Check
8. ✅ Non-existent User

### Manual Testing with grpcurl

```bash
# Create user
grpcurl -plaintext -d '{"email": "test@example.com", "name": "Test"}' localhost:50051 user.UserService/CreateUser

# Credit wallet
grpcurl -plaintext -d '{"userId": "UUID", "amount": 100}' localhost:50052 wallet.WalletService/CreditWallet
```

See [examples/curl-examples.md](examples/curl-examples.md) for more.

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Quick overview & metrics |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup instructions |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code quality & design patterns |
| [SECURITY_README.md](SECURITY_README.md) | IP protection explained |

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Services          │  NestJS + gRPC Microservices            │
├─────────────────────────────────────────────────────────────┤
│  Database          │  PostgreSQL 15 + Prisma ORM             │
├─────────────────────────────────────────────────────────────┤
│  Communication     │  Protocol Buffers (protobuf)            │
├─────────────────────────────────────────────────────────────┤
│  Validation        │  class-validator + class-transformer    │
├─────────────────────────────────────────────────────────────┤
│  Logging           │  nestjs-pino (structured JSON)          │
├─────────────────────────────────────────────────────────────┤
│  Security          │  Custom interview-mode guard            │
└─────────────────────────────────────────────────────────────┘
```

## 📝 License

This project is for **interview evaluation purposes only**. See [SECURITY_README.md](SECURITY_README.md) for IP protection details.

---

<p align="center">
  Built with ❤️ for technical assessment
</p>
