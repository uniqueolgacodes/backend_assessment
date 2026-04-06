# 🏗️ Architecture Documentation

This document explains the code architecture, design patterns, and decision-making process for the Backend Assessment project.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Patterns](#design-patterns)
3. [Service Architecture](#service-architecture)
4. [Data Flow](#data-flow)
5. [Error Handling Strategy](#error-handling-strategy)
6. [Security Implementation](#security-implementation)
7. [Code Quality Standards](#code-quality-standards)

---

## Architecture Overview

### Monorepo Structure

```
backend-assessment/
├── apps/                    # Application services
│   ├── user-service/        # User management microservice
│   └── wallet-service/      # Wallet management microservice
├── packages/                # Shared libraries
│   ├── proto/              # gRPC protocol definitions
│   ├── prisma/             # Database schema and client
│   └── security/           # IP protection and utilities
└── examples/               # Testing and examples
```

**Why Monorepo?**
- **Single source of truth** for proto definitions and database schema
- **Code reuse** across services (security, logging utilities)
- **Atomic changes** - update schema and services in one commit
- **Simplified testing** - run all tests from root

---

## Design Patterns

### 1. Microservices Pattern

```typescript
// Each service is independent with its own:
// - Database connection
// - gRPC server
// - Business logic
// - Error handling

@Module({
  imports: [SecurityModule, UserModule],
})
export class AppModule {}
```

**Benefits:**
- Independent deployment
- Technology flexibility
- Fault isolation
- Scalability

### 2. Repository Pattern (via Prisma)

```typescript
@Injectable()
export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    // Prisma acts as the repository
    return prisma.user.create({
      data: { email: input.email, name: input.name },
    });
  }
}
```

**Benefits:**
- Abstraction over database
- Type-safe queries
- Easy to test (can mock prisma)
- Migration support

### 3. DTO (Data Transfer Object) Pattern

```typescript
// Validation at the boundary
export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
```

**Benefits:**
- Input validation
- Type safety
- Clear API contracts
- Self-documenting

### 4. Inter-Service Communication Pattern

```typescript
@Injectable()
export class UserClientService implements OnModuleInit {
  private userService: UserServiceClient;

  async validateUserExists(userId: string): Promise<boolean> {
    // gRPC call to another service
    const response = await lastValueFrom(
      this.userService.getUserById({ id: userId })
    );
    return response.exists;
  }
}
```

**Benefits:**
- Type-safe inter-service calls
- Built-in error handling
- Load balancing ready
- Circuit breaker compatible

---

## Service Architecture

### User Service

```
┌─────────────────────────────────────────────────────────────┐
│                    User Service (Port 50051)                 │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Controller  │───►│   Service    │───►│   Prisma     │  │
│  │              │    │              │    │   Client     │  │
│  │ • CreateUser │    │ • Validation │    │              │  │
│  │ • GetUserById│    │ • Business   │    │ • Create     │  │
│  │              │    │   Logic      │    │ • Read       │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         └───────────────────┴───────────────────┘           │
│                         │                                   │
│                    Error Handling                           │
│                    (RPC Exceptions)                         │
└─────────────────────────────────────────────────────────────┘
```

### Wallet Service

```
┌─────────────────────────────────────────────────────────────┐
│                   Wallet Service (Port 50052)                │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  Controller  │───►│   Service    │───►│   Prisma     │  │
│  │              │    │              │    │   Client     │  │
│  │ • CreateWallet│   │ • Validation │    │              │  │
│  │ • GetWallet  │    │ • Transactions│   │ • $transaction│  │
│  │ • CreditWallet│   │ • Balance    │    │ • Atomic     │  │
│  │ • DebitWallet│    │   Checks     │    │   Updates    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                   │           │
│         │              ┌────┴────┐              │           │
│         │              │         │              │           │
│         │         ┌────┘         └────┐         │           │
│         │         │                   │         │           │
│         │    ┌────▼────┐         ┌────▼────┐   │           │
│         │    │  User   │         │Transaction│  │           │
│         │    │ Client  │         │  Record   │  │           │
│         │    │ (gRPC)  │         │           │  │           │
│         │    └─────────┘         └───────────┘  │           │
│         │                                       │           │
│         └───────────────────┬───────────────────┘           │
│                             │                               │
│                        Error Handling                       │
│                    (RPC + Business Logic)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Creating a User + Wallet (Complete Flow)

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ Client  │────►│ User Service │────►│  PostgreSQL  │     │          │
│         │     │              │     │   (users)    │     │          │
└─────────┘     └──────────────┘     └──────────────┘     │          │
     │                 │                                   │          │
     │                 │ (returns userId)                  │          │
     │                 └───────────────────────────────────┤          │
     │                                                     │          │
     │     ┌──────────────┐     ┌──────────────┐          │          │
     └────►│Wallet Service│────►│ User Service │──────────┘          │
           │              │     │ (validate)   │                     │
           │              │     └──────────────┘                     │
           │              │                    (user exists?)        │
           │              │                                          │
           │              └──────────────────┐                       │
           │                                 │                       │
           │     ┌──────────────┐     ┌──────┴─────┐                │
           └──►  │  PostgreSQL  │◄────│  Create    │                │
                 │  (wallets)   │     │  Wallet    │                │
                 └──────────────┘     └────────────┘                │
                                                                     │
                 ┌──────────────┐                                    │
                 │transactions  │◄───────────────────────────────────┘
                 └──────────────┘
```

### Wallet Credit Operation (Transaction)

```typescript
async creditWallet(userId: string, amount: number): Promise<WalletOperationResult> {
  // 1. Validation
  if (amount <= 0) throw new BadRequestException('Amount must be positive');
  
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) throw new NotFoundException('Wallet not found');

  // 2. Atomic Transaction
  const result = await prisma.$transaction(async (tx) => {
    // 2a. Update balance
    const updatedWallet = await tx.wallet.update({
      where: { id: wallet.id },
      data: { balance: { increment: amount } },
    });

    // 2b. Create transaction record
    await tx.transaction.create({
      data: {
        walletId: wallet.id,
        type: TransactionType.CREDIT,
        amount,
        description: 'Wallet credit',
      },
    });

    return updatedWallet;
  });

  // 3. Return result
  return { wallet: result, transactionId };
}
```

**Why `$transaction`?**
- **Atomicity**: Both operations succeed or both fail
- **Consistency**: Balance and transaction record always match
- **Isolation**: No race conditions during concurrent updates
- **Durability**: Changes are persisted together

---

## Error Handling Strategy

### Error Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Types                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Client Errors  │    │  Server Errors  │                │
│  │  (4xx analog)   │    │  (5xx analog)   │                │
│  │                 │    │                 │                │
│  │ • NOT_FOUND     │    │ • INTERNAL      │                │
│  │ • ALREADY_EXISTS│    │ • UNAVAILABLE   │                │
│  │ • INVALID_ARG   │    │ • UNKNOWN       │                │
│  │ • FAILED_PRECOND│    │                 │                │
│  └─────────────────┘    └─────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Error Mapping

```typescript
// Service layer throws standard errors
throw new NotFoundException(`User with ID ${userId} not found`);
throw new ConflictException('Wallet already exists');
throw new BadRequestException('Insufficient balance');

// Controller maps to gRPC status codes
@GrpcMethod('WalletService', 'DebitWallet')
async debitWallet(data: DebitWalletRequest) {
  try {
    return await this.walletService.debitWallet(...);
  } catch (error) {
    const isInsufficient = error.message.includes('Insufficient');
    throw new RpcException({
      code: isInsufficient ? status.FAILED_PRECONDITION : status.INTERNAL,
      message: error.message,
    });
  }
}
```

### gRPC Status Codes Used

| Status Code | HTTP Equivalent | Use Case |
|-------------|-----------------|----------|
| `OK` | 200 | Success |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `ALREADY_EXISTS` | 409 | Duplicate resource |
| `INVALID_ARGUMENT` | 400 | Bad input data |
| `FAILED_PRECONDITION` | 412 | Business rule violation |
| `INTERNAL` | 500 | Server error |

---

## Security Implementation

### Interview Mode Protection

```typescript
@Injectable()
export class SecurityService implements OnModuleInit {
  private readonly TRIAL_DAYS = 7;
  
  async onModuleInit() {
    // 1. Load or create config
    // 2. Validate checksum (tamper detection)
    // 3. Check expiration date
    // 4. Validate interview mode flag
    // 5. Check environment fingerprint
  }
  
  private performSecurityChecks(): void {
    // Time-bomb check
    if (now > expiresAt) {
      this.triggerSecurityLock('Trial period expired');
    }
    
    // Mode check
    if (!this.config.interviewMode) {
      this.triggerSecurityLock('Invalid deployment mode');
    }
  }
}
```

### Security Features

| Feature | Purpose | Implementation |
|---------|---------|---------------|
| Time-bomb | Limit trial period | 7-day expiration from first run |
| Checksum | Detect tampering | SHA-256 hash of config |
| Interview flag | Prevent production use | Boolean flag in config |
| Fingerprint | Environment validation | Machine-specific hash |
| Obfuscation | Hide security logic | Scattered throughout codebase |

---

## Code Quality Standards

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strictNullChecks": true,
    "noImplicitAny": true,
    "strictBindCallApply": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `UserService` |
| Interfaces | PascalCase + I prefix | `IUserResponse` |
| Methods | camelCase | `createUser` |
| Constants | UPPER_SNAKE | `TRIAL_DAYS` |
| Files | kebab-case | `user.controller.ts` |

### Code Organization

```typescript
// 1. Imports
import { ... } from '@nestjs/common';
import { ... } from './local-file';

// 2. Decorators
@Injectable()

// 3. Class definition
export class UserService {
  // 4. Private properties
  private readonly logger = new Logger('UserService');
  
  // 5. Constructor
  constructor(private readonly dependency: Dependency) {}
  
  // 6. Public methods
  async createUser(input: CreateUserInput): Promise<User> {
    // 7. Implementation
  }
  
  // 8. Private methods
  private validateInput(input: CreateUserInput): void {
    // Validation logic
  }
}
```

### Documentation Standards

```typescript
/**
 * Creates a new user in the system.
 * 
 * @param input - User creation data (email, name)
 * @returns The created user entity
 * @throws ConflictException if email already exists
 * @throws BadRequestException if input validation fails
 * 
 * @example
 * const user = await userService.createUser({
 *   email: 'john@example.com',
 *   name: 'John Doe'
 * });
 */
async createUser(input: CreateUserInput): Promise<User> {
  // Implementation
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('UserService', () => {
  let service: UserService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();
    
    service = module.get<UserService>(UserService);
  });
  
  it('should create a user', async () => {
    const result = await service.createUser({
      email: 'test@example.com',
      name: 'Test User'
    });
    
    expect(result.email).toBe('test@example.com');
  });
});
```

### Integration Tests

```typescript
// test-client.js
async function runTests() {
  // Test 1: Create user
  const user = await createUser({ email: 'test@example.com', name: 'Test' });
  assert(user.success === true);
  
  // Test 2: Create wallet
  const wallet = await createWallet({ userId: user.id });
  assert(wallet.success === true);
  
  // ... more tests
}
```

---

## Performance Considerations

### Database Optimization

```prisma
// Indexes for common queries
@@index([walletId])
@@index([createdAt])
@@index([email]) // Unique constraint creates index automatically
```

### Connection Pooling

```typescript
// Prisma client with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pooling handled automatically
});
```

### gRPC Performance

- HTTP/2 multiplexing for concurrent requests
- Binary protocol (smaller payload than JSON)
- Connection reuse between services

---

## Summary

This architecture demonstrates:

1. ✅ **Clean separation of concerns** - Each layer has a single responsibility
2. ✅ **Type safety** - TypeScript + Prisma for compile-time guarantees
3. ✅ **Error resilience** - Comprehensive error handling at all layers
4. ✅ **Testability** - Easy to mock and test each component
5. ✅ **Scalability** - Microservices can scale independently
6. ✅ **Maintainability** - Clear patterns and documentation

---

<p align="center">
  <strong>Architecture designed for production readiness 🚀</strong>
</p>
