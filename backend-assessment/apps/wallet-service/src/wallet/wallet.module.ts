import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { UserClientModule } from '../common/user-client.module';

@Module({
  imports: [UserClientModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
