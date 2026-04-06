import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { prisma, User } from '@assessment/prisma';
import { printInfo, printSuccess } from '@assessment/security';

interface CreateUserInput {
  email: string;
  name: string;
}

@Injectable()
export class UserService {
  private readonly logger = new Logger('👤 UserService');

  async createUser(input: CreateUserInput): Promise<User> {
    this.logger.log(`Creating user with email: ${input.email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email ${input.email} already exists`);
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
      },
    });

    printSuccess(`User created successfully: ${user.id}`);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    this.logger.log(`Fetching user by ID: ${id}`);

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      printInfo(`User not found: ${id}`);
      return null;
    }

    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    this.logger.log(`Fetching user by email: ${email}`);

    return prisma.user.findUnique({
      where: { email },
    });
  }

  async userExists(id: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { id },
    });
    return count > 0;
  }
}
