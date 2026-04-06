import { Injectable, Logger, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { prisma, Wallet, TransactionType } from '@assessment/prisma';
import { UserClientService } from '../common/user-client.service';
import { printInfo, printSuccess, printWarning } from '@assessment/security';
import { v4 as uuidv4 } from 'uuid';

interface WalletOperationResult {
  wallet: Wallet;
  transactionId: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger('💰 WalletService');

  constructor(private readonly userClient: UserClientService) {}

  async createWallet(userId: string): Promise<Wallet> {
    this.logger.log(`Creating wallet for user: ${userId}`);

    // Validate user exists via inter-service call
    const userExists = await this.userClient.validateUserExists(userId);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if wallet already exists
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (existingWallet) {
      throw new ConflictException(`Wallet already exists for user ${userId}`);
    }

    // Create wallet
    const wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
      },
    });

    printSuccess(`Wallet created: ${wallet.id} for user ${userId}`);
    return wallet;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    this.logger.log(`Fetching wallet for user: ${userId}`);

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      printWarning(`Wallet not found for user: ${userId}`);
      return null;
    }

    return wallet;
  }

  async creditWallet(
    userId: string,
    amount: number,
    description?: string,
  ): Promise<WalletOperationResult> {
    this.logger.log(`Crediting wallet for user ${userId} with amount ${amount}`);

    if (amount <= 0) {
      throw new BadRequestException('Credit amount must be positive');
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    const transactionId = uuidv4();

    // Use Prisma transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          id: transactionId,
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount,
          description: description || 'Wallet credit',
        },
      });

      return updatedWallet;
    });

    printSuccess(`Credited ${amount} to wallet ${result.id}. New balance: ${result.balance}`);

    return {
      wallet: result,
      transactionId,
    };
  }

  async debitWallet(
    userId: string,
    amount: number,
    description?: string,
  ): Promise<WalletOperationResult> {
    this.logger.log(`Debiting wallet for user ${userId} with amount ${amount}`);

    if (amount <= 0) {
      throw new BadRequestException('Debit amount must be positive');
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }

    // Check sufficient balance
    const currentBalance = Number(wallet.balance);
    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance. Current: ${currentBalance}, Required: ${amount}`
      );
    }

    const transactionId = uuidv4();

    // Use Prisma transaction for atomic operation
    const result = await prisma.$transaction(async (tx) => {
      // Update wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          id: transactionId,
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount,
          description: description || 'Wallet debit',
        },
      });

      return updatedWallet;
    });

    printSuccess(`Debited ${amount} from wallet ${result.id}. New balance: ${result.balance}`);

    return {
      wallet: result,
      transactionId,
    };
  }

  async getWalletBalance(userId: string): Promise<number> {
    const wallet = await this.getWalletByUserId(userId);
    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }
    return Number(wallet.balance);
  }
}
