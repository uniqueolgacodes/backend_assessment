import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface SecurityConfig {
  interviewMode: boolean;
  initializedAt: string;
  instanceId: string;
  checksum: string;
}

@Injectable()
export class SecurityService implements OnModuleInit {
  private readonly logger = new Logger('🔒 SecurityGuard');
  private readonly TRIAL_DAYS = 7;
  private readonly CONFIG_FILE = '.assessment-lock';
  private config: SecurityConfig | null = null;
  private readonly INSTANCE_FINGERPRINT = this.generateFingerprint();

  async onModuleInit() {
    await this.initializeSecurity();
  }

  private generateFingerprint(): string {
    const machineData = `${process.platform}-${process.arch}-${JSON.stringify(process.env)}`;
    return crypto.createHash('sha256').update(machineData).digest('hex').substring(0, 16);
  }

  private async initializeSecurity(): Promise<void> {
    const configPath = path.join(process.cwd(), this.CONFIG_FILE);
    
    if (fs.existsSync(configPath)) {
      await this.loadExistingConfig(configPath);
    } else {
      await this.createNewConfig(configPath);
    }

    this.performSecurityChecks();
  }

  private async loadExistingConfig(configPath: string): Promise<void> {
    try {
      const data = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
      
      if (!this.validateConfig(parsed)) {
        this.triggerSecurityLock('Configuration tampering detected');
        return;
      }

      this.config = parsed;
      this.logger.log('Security configuration loaded');
    } catch (error) {
      this.triggerSecurityLock('Invalid configuration format');
    }
  }

  private async createNewConfig(configPath: string): Promise<void> {
    const now = new Date();
    const config: SecurityConfig = {
      interviewMode: true,
      initializedAt: now.toISOString(),
      instanceId: this.INSTANCE_FINGERPRINT,
      checksum: '',
    };
    
    config.checksum = this.calculateChecksum(config);
    
    const encoded = Buffer.from(JSON.stringify(config)).toString('base64');
    fs.writeFileSync(configPath, encoded, { mode: 0o600 });
    
    this.config = config;
    this.logger.log(`Interview mode activated - Trial expires in ${this.TRIAL_DAYS} days`);
  }

  private calculateChecksum(config: Omit<SecurityConfig, 'checksum'>): string {
    const data = `${config.interviewMode}-${config.initializedAt}-${config.instanceId}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }

  private validateConfig(config: any): boolean {
    if (!config || typeof config !== 'object') return false;
    if (!config.initializedAt || !config.instanceId) return false;
    
    const { checksum, ...rest } = config;
    const expectedChecksum = this.calculateChecksum(rest);
    
    return checksum === expectedChecksum;
  }

  private performSecurityChecks(): void {
    if (!this.config) return;

    // Check 1: Time-bomb validation
    const initializedAt = new Date(this.config.initializedAt);
    const expiresAt = new Date(initializedAt);
    expiresAt.setDate(expiresAt.getDate() + this.TRIAL_DAYS);
    
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (now > expiresAt) {
      this.triggerSecurityLock('Trial period expired');
      return;
    }

    // Check 2: Interview mode flag
    if (!this.config.interviewMode) {
      this.triggerSecurityLock('Invalid deployment mode');
      return;
    }

    // Check 3: Environment fingerprint (relaxed for interview)
    if (this.config.instanceId !== this.INSTANCE_FINGERPRINT) {
      this.logger.warn('Environment change detected - Relaxed check for interview');
    }

    this.logger.log(`Security validated - ${daysRemaining} days remaining in trial`);
  }

  private triggerSecurityLock(reason: string): never {
    this.logger.error(`🚫 SECURITY LOCK: ${reason}`);
    this.logger.error('This assessment is for interview evaluation only.');
    this.logger.error('Contact: interview@assessment.local for production licensing.');
    
    // Graceful shutdown with delay for logging
    setTimeout(() => {
      process.exit(1);
    }, 100);
    
    throw new Error(`SECURITY_LOCK: ${reason}`);
  }

  getSecurityStatus(): { valid: boolean; daysRemaining: number; mode: string } {
    if (!this.config) return { valid: false, daysRemaining: 0, mode: 'unknown' };

    const initializedAt = new Date(this.config.initializedAt);
    const expiresAt = new Date(initializedAt);
    expiresAt.setDate(expiresAt.getDate() + this.TRIAL_DAYS);
    
    const now = new Date();
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      valid: daysRemaining > 0 && this.config.interviewMode,
      daysRemaining: Math.max(0, daysRemaining),
      mode: this.config.interviewMode ? 'interview' : 'unknown',
    };
  }

  isInterviewMode(): boolean {
    return this.config?.interviewMode ?? false;
  }
}
