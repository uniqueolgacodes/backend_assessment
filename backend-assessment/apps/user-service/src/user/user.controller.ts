import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { UserService } from './user.service';
import { printGrpcCall, printSuccess, printError } from '@assessment/security';

interface CreateUserRequest {
  email: string;
  name: string;
}

interface CreateUserResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  success: boolean;
  message: string;
}

interface GetUserByIdRequest {
  id: string;
}

interface GetUserByIdResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  exists: boolean;
  message: string;
}

@Controller()
export class UserController {
  private readonly logger = new Logger('👤 UserController');

  constructor(private readonly userService: UserService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    printGrpcCall('CreateUser', { email: data.email, name: data.name });
    
    try {
      const user = await this.userService.createUser(data);
      printSuccess(`User created: ${user.email}`);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        success: true,
        message: 'User created successfully',
      };
    } catch (error) {
      printError(`Failed to create user: ${error.message}`);
      
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: error.message || 'Failed to create user',
      });
    }
  }

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(data: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    printGrpcCall('GetUserById', { id: data.id });
    
    const user = await this.userService.getUserById(data.id);
    
    if (!user) {
      printError(`User not found: ${data.id}`);
      
      return {
        id: data.id,
        email: '',
        name: '',
        createdAt: '',
        exists: false,
        message: 'User not found',
      };
    }

    printSuccess(`User found: ${user.email}`);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      exists: true,
      message: 'User found',
    };
  }
}
