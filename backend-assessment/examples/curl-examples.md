# gRPC Testing Examples

Since gRPC uses HTTP/2 and binary protocol, direct `curl` commands are not applicable. Instead, use the following tools and methods to test the services.

## 🛠️ Testing Tools

### 1. Automated Test Client (Recommended)

We provide a comprehensive test client that automates all test scenarios:

```bash
# Make sure both services are running
node examples/test-client.js
```

This will run 8 automated tests covering all endpoints and edge cases.

### 2. grpcurl (Command-line gRPC tool)

Install `grpcurl` for manual testing:

```bash
# macOS
brew install grpcurl

# Linux
sudo apt-get install grpcurl
```

#### User Service Examples

**Create User:**
```bash
grpcurl -plaintext \
  -d '{"email": "john.doe@example.com", "name": "John Doe"}' \
  localhost:50051 \
  user.UserService/CreateUser
```

**Get User by ID:**
```bash
grpcurl -plaintext \
  -d '{"id": "USER_ID_HERE"}' \
  localhost:50051 \
  user.UserService/GetUserById
```

#### Wallet Service Examples

**Create Wallet:**
```bash
grpcurl -plaintext \
  -d '{"userId": "USER_ID_HERE"}' \
  localhost:50052 \
  wallet.WalletService/CreateWallet
```

**Get Wallet:**
```bash
grpcurl -plaintext \
  -d '{"userId": "USER_ID_HERE"}' \
  localhost:50052 \
  wallet.WalletService/GetWallet
```

**Credit Wallet:**
```bash
grpcurl -plaintext \
  -d '{"userId": "USER_ID_HERE", "amount": 100.00, "description": "Initial deposit"}' \
  localhost:50052 \
  wallet.WalletService/CreditWallet
```

**Debit Wallet:**
```bash
grpcurl -plaintext \
  -d '{"userId": "USER_ID_HERE", "amount": 50.00, "description": "Purchase"}' \
  localhost:50052 \
  wallet.WalletService/DebitWallet
```

### 3. Bloom RPC (GUI Client)

For a visual interface, use [Bloom RPC](https://github.com/bloomrpc/bloomrpc):

1. Download and install Bloom RPC
2. Import the proto files from `packages/proto/proto/`
3. Connect to `localhost:50051` (User Service) or `localhost:50052` (Wallet Service)
4. Send requests with the GUI

### 4. Postman gRPC Support

Postman now supports gRPC:

1. Open Postman
2. Click "New" → "gRPC Request"
3. Enter server URL: `localhost:50051` or `localhost:50052`
4. Import the proto file
5. Select the method and send requests

## 📋 Test Scenarios

### Complete Flow Test

```bash
# 1. Create a user
USER_RESPONSE=$(grpcurl -plaintext \
  -d '{"email": "test@example.com", "name": "Test User"}' \
  localhost:50051 \
  user.UserService/CreateUser)

# Extract user ID (requires jq)
USER_ID=$(echo $USER_RESPONSE | jq -r '.id')

# 2. Create wallet for user
grpcurl -plaintext \
  -d "{\"userId\": \"$USER_ID\"}" \
  localhost:50052 \
  wallet.WalletService/CreateWallet

# 3. Credit wallet
grpcurl -plaintext \
  -d "{\"userId\": \"$USER_ID\", \"amount\": 100.00}" \
  localhost:50052 \
  wallet.WalletService/CreditWallet

# 4. Check balance
grpcurl -plaintext \
  -d "{\"userId\": \"$USER_ID\"}" \
  localhost:50052 \
  wallet.WalletService/GetWallet

# 5. Debit wallet
grpcurl -plaintext \
  -d "{\"userId\": \"$USER_ID\", \"amount\": 30.00}" \
  localhost:50052 \
  wallet.WalletService/DebitWallet
```

## 🔍 Inspecting Services

**List available services:**
```bash
grpcurl -plaintext localhost:50051 list
grpcurl -plaintext localhost:50052 list
```

**List methods in a service:**
```bash
grpcurl -plaintext localhost:50051 list user.UserService
grpcurl -plaintext localhost:50052 list wallet.WalletService
```

**Describe a method:**
```bash
grpcurl -plaintext localhost:50051 describe user.UserService.CreateUser
```

## 🐛 Debugging

**Enable verbose logging:**
```bash
GRPC_VERBOSITY=DEBUG grpcurl -plaintext localhost:50051 list
```

**Check service health:**
```bash
# User Service
grpcurl -plaintext localhost:50051 grpc.health.v1.Health/Check

# Wallet Service  
grpcurl -plaintext localhost:50052 grpc.health.v1.Health/Check
```

## 📊 Expected Responses

### Create User Response
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "name": "User Name",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "success": true,
  "message": "User created successfully"
}
```

### Create Wallet Response
```json
{
  "id": "uuid-string",
  "userId": "user-uuid-string",
  "balance": "0",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "success": true,
  "message": "Wallet created successfully"
}
```

### Credit Wallet Response
```json
{
  "id": "wallet-uuid-string",
  "userId": "user-uuid-string",
  "newBalance": "100",
  "creditedAmount": 100,
  "success": true,
  "message": "Wallet credited successfully",
  "transactionId": "transaction-uuid-string"
}
```

### Error Response
```json
{
  "error": "User with email user@example.com already exists",
  "code": 6
}
```
