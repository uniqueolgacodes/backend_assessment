import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { printGrpcCall, printSuccess, printError } from '@assessment/security';

interface UserServiceClient {
  getUserById(data: { id: string }): Promise<{
    id: string;
    email: string;
    name: string;
    createdAt: string;
    exists: boolean;
    message: string;
  }>;
}

@Injectable()
export class UserClientService implements OnModuleInit {
  private readonly logger = new Logger('🔗 UserClient');
  private userService: UserServiceClient;

  constructor(@Inject('USER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserServiceClient>('UserService');
    this.logger.log('User service client initialized');
  }

  async validateUserExists(userId: string): Promise<boolean> {
    printGrpcCall('UserService.GetUserById (inter-service)', { userId });
    
    try {
      const response = await lastValueFrom(
        this.userService.getUserById({ id: userId })
      );

      if (response.exists) {
        printSuccess(`User validation passed: ${userId}`);
        return true;
      } else {
        printError(`User validation failed: ${userId} not found`);
        return false;
      }
    } catch (error) {
      printError(`User service communication error: ${error.message}`);
      throw new Error(`Failed to validate user: ${error.message}`);
    }
  }

  async getUserDetails(userId: string): Promise<{
    id: string;
    email: string;
    name: string;
    exists: boolean;
  }> {
    try {
      const response = await lastValueFrom(
        this.userService.getUserById({ id: userId })
      );

      return {
        id: response.id,
        email: response.email,
        name: response.name,
        exists: response.exists,
      };
    } catch (error) {
      this.logger.error(`Failed to get user details: ${error.message}`);
      throw error;
    }
  }
}
