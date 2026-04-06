import { Module, Global } from '@nestjs/common';
import { SecurityService } from './security.service';
import { SecurityGuard } from './security.guard';

@Global()
@Module({
  providers: [SecurityService, SecurityGuard],
  exports: [SecurityService, SecurityGuard],
})
export class SecurityModule {}
