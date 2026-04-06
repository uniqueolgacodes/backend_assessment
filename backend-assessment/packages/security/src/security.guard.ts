import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SecurityService } from './security.service';

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly logger = new Logger('🔒 SecurityGuard');

  constructor(private readonly securityService: SecurityService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const status = this.securityService.getSecurityStatus();
    
    if (!status.valid) {
      this.logger.error('Security check failed - Service blocked');
      return false;
    }

    return true;
  }
}
