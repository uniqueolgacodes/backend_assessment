#!/usr/bin/env node

/**
 * Backend Assessment - gRPC Test Client
 * 
 * This script provides automated testing for both User and Wallet services.
 * Run with: node examples/test-client.js
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Helper functions
const log = (msg) => console.log(msg);
const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);
const header = (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`);
const divider = () => console.log(`${colors.magenta}─────────────────────────────────────────────────────────────${colors.reset}`);

// Print banner
function printBanner() {
  log(`${colors.cyan}`);
  log('╔════════════════════════════════════════════════════════════════╗');
  log('║                   🧪 gRPC TEST CLIENT 🧪                       ║');
  log('║         Backend Assessment - Automated Testing Suite           ║');
  log('╚════════════════════════════════════════════════════════════════╝');
  log(`${colors.reset}\n`);
}

// Load proto files
function loadProto(protoPath, packageName) {
  const packageDefinition = protoLoader.loadSync(protoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  });
  return grpc.loadPackageDefinition(packageDefinition)[packageName];
}

// Create gRPC clients
function createClients() {
  const userProtoPath = path.join(__dirname, '../packages/proto/proto/user.proto');
  const walletProtoPath = path.join(__dirname, '../packages/proto/proto/wallet.proto');

  const userPackage = loadProto(userProtoPath, 'user');
  const walletPackage = loadProto(walletProtoPath, 'wallet');

  const userClient = new userPackage.UserService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  const walletClient = new walletPackage.WalletService(
    'localhost:50052',
    grpc.credentials.createInsecure()
  );

  return { userClient, walletClient };
}

// Promisify gRPC calls
function promisify(client, method) {
  return (request) => {
    return new Promise((resolve, reject) => {
      client[method](request, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    });
  };
}

// Test cases
async function runTests() {
  printBanner();

  const { userClient, walletClient } = createClients();

  // Promisified methods
  const createUser = promisify(userClient, 'createUser');
  const getUserById = promisify(userClient, 'getUserById');
  const createWallet = promisify(walletClient, 'createWallet');
  const getWallet = promisify(walletClient, 'getWallet');
  const creditWallet = promisify(walletClient, 'creditWallet');
  const debitWallet = promisify(walletClient, 'debitWallet');

  let createdUserId = null;
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Create User
  header('TEST 1: Create User');
  try {
    const timestamp = Date.now();
    const response = await createUser({
      email: `test.user.${timestamp}@example.com`,
      name: 'Test User'
    });
    
    if (response.success) {
      createdUserId = response.id;
      success(`User created: ${response.email} (ID: ${response.id})`);
      info(`Created at: ${response.createdAt}`);
      testsPassed++;
    } else {
      error(`Failed to create user: ${response.message}`);
      testsFailed++;
    }
  } catch (err) {
    error(`Error: ${err.message}`);
    testsFailed++;
  }
  divider();

  // Test 2: Get User by ID
  header('TEST 2: Get User by ID');
  if (createdUserId) {
    try {
      const response = await getUserById({ id: createdUserId });
      
      if (response.exists) {
        success(`User found: ${response.name} (${response.email})`);
        testsPassed++;
      } else {
        error(`User not found: ${response.message}`);
        testsFailed++;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      testsFailed++;
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 3: Create Wallet
  header('TEST 3: Create Wallet');
  if (createdUserId) {
    try {
      const response = await createWallet({ userId: createdUserId });
      
      if (response.success) {
        success(`Wallet created for user: ${createdUserId}`);
        info(`Wallet ID: ${response.id}`);
        info(`Initial balance: ${response.balance}`);
        testsPassed++;
      } else {
        error(`Failed to create wallet: ${response.message}`);
        testsFailed++;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      testsFailed++;
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 4: Get Wallet
  header('TEST 4: Get Wallet');
  if (createdUserId) {
    try {
      const response = await getWallet({ userId: createdUserId });
      
      if (response.exists) {
        success(`Wallet retrieved for user: ${createdUserId}`);
        info(`Balance: ${response.balance}`);
        testsPassed++;
      } else {
        error(`Wallet not found: ${response.message}`);
        testsFailed++;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      testsFailed++;
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 5: Credit Wallet
  header('TEST 5: Credit Wallet (+100.00)');
  if (createdUserId) {
    try {
      const response = await creditWallet({
        userId: createdUserId,
        amount: 100.00,
        description: 'Test credit'
      });
      
      if (response.success) {
        success(`Credited ${response.creditedAmount} to wallet`);
        info(`New balance: ${response.newBalance}`);
        info(`Transaction ID: ${response.transactionId}`);
        testsPassed++;
      } else {
        error(`Failed to credit wallet: ${response.message}`);
        testsFailed++;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      testsFailed++;
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 6: Debit Wallet
  header('TEST 6: Debit Wallet (-30.00)');
  if (createdUserId) {
    try {
      const response = await debitWallet({
        userId: createdUserId,
        amount: 30.00,
        description: 'Test debit'
      });
      
      if (response.success) {
        success(`Debited ${response.debitedAmount} from wallet`);
        info(`New balance: ${response.newBalance}`);
        info(`Transaction ID: ${response.transactionId}`);
        testsPassed++;
      } else {
        error(`Failed to debit wallet: ${response.message}`);
        testsFailed++;
      }
    } catch (err) {
      error(`Error: ${err.message}`);
      testsFailed++;
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 7: Insufficient Balance
  header('TEST 7: Insufficient Balance Check');
  if (createdUserId) {
    try {
      await debitWallet({
        userId: createdUserId,
        amount: 1000.00,
        description: 'Should fail'
      });
      error('Should have failed with insufficient balance');
      testsFailed++;
    } catch (err) {
      if (err.message.includes('Insufficient') || err.code === 9) {
        success('Correctly rejected debit with insufficient balance');
        testsPassed++;
      } else {
        error(`Unexpected error: ${err.message}`);
        testsFailed++;
      }
    }
  } else {
    error('Skipped: No user ID available');
    testsFailed++;
  }
  divider();

  // Test 8: Get Non-existent User
  header('TEST 8: Get Non-existent User');
  try {
    const response = await getUserById({ id: 'non-existent-id' });
    
    if (!response.exists) {
      success('Correctly returned not found for non-existent user');
      testsPassed++;
    } else {
      error('Should have returned not found');
      testsFailed++;
    }
  } catch (err) {
    error(`Error: ${err.message}`);
    testsFailed++;
  }
  divider();

  // Summary
  header('📊 TEST SUMMARY');
  log(`\n${colors.bright}Total Tests: ${testsPassed + testsFailed}${colors.reset}`);
  log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  
  const passRate = ((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1);
  log(`\n${colors.cyan}Pass Rate: ${passRate}%${colors.reset}`);

  if (testsFailed === 0) {
    log(`\n${colors.green}${colors.bright}🎉 All tests passed! 🎉${colors.reset}\n`);
  } else {
    log(`\n${colors.yellow}${colors.bright}⚠️  Some tests failed. Review the output above.${colors.reset}\n`);
  }

  // Close gRPC connections
  userClient.close();
  walletClient.close();
}

// Run tests
runTests().catch(err => {
  console.error(`${colors.red}Fatal error: ${err.message}${colors.reset}`);
  process.exit(1);
});
