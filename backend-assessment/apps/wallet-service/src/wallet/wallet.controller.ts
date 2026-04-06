import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { WalletService } from './wallet.service';
import { printGrpcCall, printSuccess, printError, printWarning } from '@assessment/security';

interface CreateWalletRequest {
  userId: string;
}

interface CreateWalletResponse {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  success: boolean;
  message: string;
}

interface GetWalletRequest {
  userId: string;
}

interface GetWalletResponse {
  id: string;
  userId: string;
  balance: number;
  createdAt: string;
  exists: boolean;
  message: string;
}

interface CreditWalletRequest {
  userId: string;
  amount: number;
  description?: string;
}

interface CreditWalletResponse {
  id: string;
  userId: string;
  newBalance: number;
  creditedAmount: number;
  success: boolean;
  message: string;
  transactionId: string;
}

interface DebitWalletRequest {
  userId: string;
  amount: number;
  description?: string;
}

interface DebitWalletResponse {
  id: string;
  userId: string;
  newBalance: number;
  debitedAmount: number;
  success: boolean;
  message: string;
  transactionId: string;
}

@Controller()
export class WalletController {
  private readonly logger = new Logger('💰 WalletController');

  constructor(private readonly walletService: WalletService) {}

  @GrpcMethod('WalletService', 'CreateWallet')
  async createWallet(data: CreateWalletRequest): Promise<CreateWalletResponse> {
    printGrpcCall('CreateWallet', { userId: data.userId });
    
    try {
      const wallet = await this.walletService.createWallet(data.userId);
      printSuccess(`Wallet created for user: ${data.userId}`);
      
      return {
        id: wallet.id,
        userId: wallet.userId,
        balance: Number(wallet.balance),
        createdAt: wallet.createdAt.toISOString(),
        success: true,
        message: 'Wallet created successfully',
      };
    } catch (error) {
      printError(`Failed to create wallet: ${error.message}`);
      
      throw new RpcException({
        code: error.message.includes('not found') ? status.NOT_FOUND : status.ALREADY_EXISTS,
        message: error.message,
      });
    }
  }

  @GrpcMethod('WalletService', 'GetWallet')
  async getWallet(data: GetWalletRequest): Promise<GetWalletResponse> {
    printGrpcCall('GetWallet', { userId: data.userId });
    
    const wallet = await this.walletService.getWalletByUserId(data.userId);
    
    if (!wallet) {
      printWarning(`Wallet not found for user: ${data.userId}`);
      
      return {
        id: '',
        userId: data.userId,
        balance: 0,
        createdAt: '',
        exists: false,
        message: 'Wallet not found for this user',
      };
    }

    printSuccess(`Wallet retrieved for user: ${data.userId}`);
    
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance),
      createdAt: wallet.createdAt.toISOString(),
      exists: true,
      message: 'Wallet found',
    };
  }

  @GrpcMethod('WalletService', 'CreditWallet')
  async creditWallet(data: CreditWalletRequest): Promise<CreditWalletResponse> {
    printGrpcCall('CreditWallet', { userId: data.userId, amount: data.amount });
    
    try {
      const result = await this.walletService.creditWallet(
        data.userId,
        data.amount,
        data.description,
      );
      
      printSuccess(`Wallet credited: +${data.amount} for user ${data.userId}`);
      
      return {
        id: result.wallet.id,
        userId: result.wallet.userId,
        newBalance: Number(result.wallet.balance),
        creditedAmount: data.amount,
        success: true,
        message: 'Wallet credited successfully',
        transactionId: result.transactionId,
      };
    } catch (error) {
      printError(`Failed to credit wallet: ${error.message}`);
      
      throw new RpcException({
        code: error.message.includes('not found') ? status.NOT_FOUND : status.INTERNAL,
        message: error.message,
      });
    }
  }

  @GrpcMethod('WalletService', 'DebitWallet')
  async debitWallet(data: DebitWalletRequest): Promise<DebitWalletResponse> {
    printGrpcCall('DebitWallet', { userId: data.userId, amount: data.amount });
    
    try {
      const result = await this.walletService.debitWallet(
        data.userId,
        data.amount,
        data.description,
      );
      
      printSuccess(`Wallet debited: -${data.amount} for user ${data.userId}`);
      
      return {
        id: result.wallet.id,
        userId: result.wallet.userId,
        newBalance: Number(result.wallet.balance),
        debitedAmount: data.amount,
        success: true,
        message: 'Wallet debited successfully',
        transactionId: result.transactionId,
      };
    } catch (error) {
      printError(`Failed to debit wallet: ${error.message}`);
      
      const isInsufficientFunds = error.message.includes('Insufficient');
      throw new RpcException({
        code: isInsufficientFunds ? status.FAILED_PRECONDITION : status.INTERNAL,
        message: error.message,
      });
    }
  }
}
