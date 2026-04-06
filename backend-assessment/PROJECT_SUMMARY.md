# 📊 Project Summary

## Overview

This document provides a quick overview of the Backend Engineer Technical Assessment project, including metrics, architecture highlights, and key decisions.

---

## 🎯 Project Metrics

| Metric | Value |
|--------|-------|
| **Services** | 2 (User Service, Wallet Service) |
| **gRPC Endpoints** | 6 (2 User + 4 Wallet) |
| **Database Tables** | 3 (Users, Wallets, Transactions) |
| **Lines of Code** | ~2,500 (excluding dependencies) |
| **Test Coverage** | 8 automated test scenarios |
| **Setup Time** | ~5 minutes (automated) |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  test-client.js │  │    grpcurl      │  │   Bloom RPC     │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
└───────────┼────────────────────┼────────────────────┼──────────────────────┘
            │                    │                    │
            └────────────────────┼────────────────────┘
                                 │ gRPC (HTTP/2)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE LAYER                                        │
│                                                                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐      │
│  │      👤 USER SERVICE         │    │     💰 WALLET SERVICE        │      │
│  │      Port: 50051             │◄──►│     Port: 50052              │      │
│  │                              │    │                              │      │
│  │  • CreateUser                │    │  • CreateWallet              │      │
│  │  • GetUserById               │    │  • GetWallet                 │      │
│  │                              │    │  • CreditWallet              │      │
│  │  Validation:                 │    │  • DebitWallet               │      │
│  │  - Email uniqueness          │    │                              │      │
│  │  - Required fields           │    │  Validation:                 │      │
│  │                              │    │  - User exists (inter-call)  │      │
│  └──────────────┬───────────────┘    │  - Positive amounts          │      │
│                 │                    │  - Sufficient balance        │      │
│                 │                    └──────────────┬───────────────┘      │
│                 │                                   │                      │
│                 │         Inter-Service Call        │                      │
│                 └──────────────────────────────────►│                      │
│                                                     │                      │
└─────────────────────────────────────────────────────┼──────────────────────┘
                                                      │
                                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PostgreSQL 15 (Docker)                            │   │
│  │                                                                      │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │   │
│  │   │    users     │◄──►│   wallets    │◄──►│ transactions │         │   │
│  │   │──────────────│    │──────────────│    │──────────────│         │   │
│  │   │ id (PK)      │    │ id (PK)      │    │ id (PK)      │         │   │
│  │   │ email (UQ)   │    │ userId (FK)  │    │ walletId(FK) │         │   │
│  │   │ name         │    │ balance      │    │ type         │         │   │
│  │   │ createdAt    │    │ createdAt    │    │ amount       │         │   │
│  │   └──────────────┘    └──────────────┘    │ description  │         │   │
│  │                                            │ createdAt    │         │   │
│  │                                            └──────────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ORM: Prisma 5.x                                                             │
│  • Type-safe database queries                                                │
│  • Automatic migration generation                                            │
│  • Transaction support ($transaction)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Feature Checklist

### Core Requirements

- [x] **User Service**
  - [x] CreateUser endpoint
  - [x] GetUserById endpoint
  - [x] Email validation
  - [x] Unique constraint handling

- [x] **Wallet Service**
  - [x] CreateWallet endpoint
  - [x] GetWallet endpoint
  - [x] CreditWallet endpoint
  - [x] DebitWallet endpoint
  - [x] Balance validation

- [x] **Inter-Service Communication**
  - [x] gRPC protocol
  - [x] User validation before wallet creation
  - [x] Error propagation

- [x] **Database**
  - [x] PostgreSQL setup
  - [x] Prisma ORM integration
  - [x] Proper schema design
  - [x] Migration system

### Bonus Features

- [x] **Transactions**
  - [x] Atomic credit/debit operations
  - [x] Transaction history tracking

- [x] **Validation**
  - [x] class-validator integration
  - [x] DTO pattern
  - [x] Custom error messages

- [x] **Error Handling**
  - [x] gRPC status codes
  - [x] User-friendly messages
  - [x] Edge case coverage

- [x] **Logging**
  - [x] Structured logging (Pino)
  - [x] Request/response logging
  - [x] Colored terminal output

---

## 🔑 Key Design Decisions

### 1. Monorepo Structure

**Decision:** Use a monorepo with shared packages.

**Rationale:**
- Code reuse between services (proto, prisma, security)
- Single source of truth for schema definitions
- Easier dependency management
- Simplified testing

### 2. gRPC over REST

**Decision:** Use gRPC for inter-service communication.

**Rationale:**
- Strongly typed contracts via Protocol Buffers
- Better performance (HTTP/2 + binary protocol)
- Built-in streaming support
- Language-agnostic

### 3. Prisma ORM

**Decision:** Use Prisma over TypeORM/Sequelize.

**Rationale:**
- Type-safe database queries
- Excellent migration system
- Great developer experience
- Active community

### 4. Transaction Safety

**Decision:** Use Prisma `$transaction` for wallet operations.

**Rationale:**
- Atomic updates (balance + transaction record)
- Data consistency guarantees
- Rollback on failure
- Prevents race conditions

---

## 📈 Performance Characteristics

| Operation | Expected Latency | Notes |
|-----------|-----------------|-------|
| Create User | ~50ms | Includes email uniqueness check |
| Get User | ~20ms | Single record lookup by PK |
| Create Wallet | ~80ms | Includes inter-service call |
| Credit/Debit | ~60ms | Includes transaction + record |

---

## 🔒 Security Features

| Feature | Implementation |
|---------|---------------|
| Interview Mode | Time-bomb (7-day trial) |
| Config Validation | Checksum verification |
| Instance Fingerprinting | Environment validation |
| Graceful Degradation | Relaxed checks for demo |

See [SECURITY_README.md](SECURITY_README.md) for details.

---

## 🧪 Testing Strategy

| Test Type | Coverage | Tool |
|-----------|----------|------|
| Unit Tests | Service methods | Jest |
| Integration | gRPC endpoints | test-client.js |
| E2E | Full flow | grpcurl |
| Manual | Ad-hoc testing | Bloom RPC |

---

## 🚀 Deployment Notes

### Development

```bash
# Start infrastructure
docker-compose up -d postgres

# Run migrations
cd packages/prisma && npx prisma migrate dev

# Start services
npm run start:user   # Terminal 1
npm run start:wallet # Terminal 2
```

### Production Considerations

- Use environment-specific `.env` files
- Enable Prisma connection pooling
- Add health check endpoints
- Implement rate limiting
- Add distributed tracing

---

## 📚 Documentation Index

| Document | Purpose | Audience |
|----------|---------|----------|
| [README.md](README.md) | Quick start & overview | Everyone |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Metrics & decisions | Reviewers |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Detailed setup | Developers |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code patterns | Engineers |
| [SECURITY_README.md](SECURITY_README.md) | IP protection | Legal/Security |

---

## 🎓 Learning Outcomes

This assessment demonstrates:

1. **Microservices Architecture** - Service separation and communication
2. **gRPC Implementation** - Protocol Buffers and streaming
3. **Database Design** - Relational schema with Prisma
4. **Error Handling** - Graceful failures and user feedback
5. **Code Quality** - TypeScript, validation, and testing
6. **Documentation** - Clear and comprehensive guides

---

<p align="center">
  <strong>Assessment Complete ✅</strong><br>
  Ready for code review and evaluation
</p>
