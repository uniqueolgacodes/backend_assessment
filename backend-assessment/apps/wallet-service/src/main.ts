import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { printStartupBanner, printShutdownBanner } from '@assessment/security';

const SERVICE_NAME = 'wallet-service';
const SERVICE_VERSION = '1.0.0';

async function bootstrap() {
  const logger = new Logger('🚀 Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const port = configService.get<number>('GRPC_PORT', 50052);
  const protoPath = join(__dirname, '../../packages/proto/proto/wallet.proto');
  
  // Configure gRPC microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'wallet',
      protoPath: protoPath,
      url: `0.0.0.0:${port}`,
      loader: {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable graceful shutdown
  app.enableShutdownHooks();

  // Start microservice
  await app.startAllMicroservices();

  // Print cool startup banner
  printStartupBanner({
    serviceName: SERVICE_NAME,
    port,
    version: SERVICE_VERSION,
    features: [
      'gRPC Communication',
      'Inter-Service User Validation',
      'Prisma Transactions',
      'Structured Logging (Pino)',
      'Interview Mode Security',
    ],
  });

  logger.log(`gRPC Server running on port ${port}`);
  logger.log(`Proto file: ${protoPath}`);

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    printShutdownBanner(SERVICE_NAME);
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    printShutdownBanner(SERVICE_NAME);
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start wallet service:', error);
  process.exit(1);
});
