// Export proto paths for service consumption
export const USER_PROTO_PATH = __dirname + '/../proto/user.proto';
export const WALLET_PROTO_PATH = __dirname + '/../proto/wallet.proto';

// Re-export generated types (after compilation)
export * from '../dist/user';
export * from '../dist/wallet';
