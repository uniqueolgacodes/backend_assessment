import * as chalk from 'chalk';
import * as figlet from 'figlet';

export interface BannerConfig {
  serviceName: string;
  port: number;
  version: string;
  features: string[];
}

const ASCII_LOGO = `
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║     ██╗  ██╗███████╗██╗   ██╗███████╗████████╗██████╗  ██╗   ║
    ║     ██║ ██╔╝██╔════╝██║   ██║██╔════╝╚══██╔══╝╚════██╗███║   ║
    ║     █████╔╝ █████╗  ██║   ██║███████╗   ██║    █████╔╝╚██║   ║
    ║     ██╔═██╗ ██╔══╝  ██║   ██║╚════██║   ██║    ╚═══██╗ ██║   ║
    ║     ██║  ██╗███████╗╚██████╔╝███████║   ██║   ██████╔╝ ██║   ║
    ║     ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═════╝  ╚═╝   ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
`;

const SERVICE_BANNERS: Record<string, string> = {
  'user-service': `
    ╔══════════════════════════════════════════════════════════════╗
    ║  👤 USER SERVICE                                              ║
    ║     Manages user identities and profiles                      ║
    ╚══════════════════════════════════════════════════════════════╝
  `,
  'wallet-service': `
    ╔══════════════════════════════════════════════════════════════╗
    ║  💰 WALLET SERVICE                                            ║
    ║     Handles balances and transactions                         ║
    ╚══════════════════════════════════════════════════════════════╝
  `,
};

export function printStartupBanner(config: BannerConfig): void {
  console.clear();
  
  // Main logo
  console.log(chalk.cyan(ASCII_LOGO));
  
  // Service-specific banner
  const serviceBanner = SERVICE_BANNERS[config.serviceName] || `
    ╔══════════════════════════════════════════════════════════════╗
    ║  🚀 ${config.serviceName.toUpperCase().padEnd(54)}║
    ╚══════════════════════════════════════════════════════════════╝
  `;
  console.log(chalk.magenta(serviceBanner));

  // Status box
  console.log(chalk.gray('    ┌────────────────────────────────────────────────────────────┐'));
  console.log(chalk.gray('    │') + chalk.green(`  🟢 Status:     OPERATIONAL                                  `) + chalk.gray('│'));
  console.log(chalk.gray('    │') + chalk.yellow(`  📡 Port:       ${config.port.toString().padEnd(45)}`) + chalk.gray('│'));
  console.log(chalk.gray('    │') + chalk.blue(`  🏷️  Version:    ${config.version.padEnd(45)}`) + chalk.gray('│'));
  console.log(chalk.gray('    └────────────────────────────────────────────────────────────┘'));

  // Features
  console.log(chalk.cyan('\n    ✨ Features Enabled:'));
  config.features.forEach((feature, index) => {
    const icon = ['🔐', '⚡', '📊', '🔍', '✅'][index % 5];
    console.log(chalk.white(`       ${icon} ${feature}`));
  });

  // Security notice
  console.log(chalk.red('\n    ⚠️  INTERVIEW MODE - TRIAL PERIOD ACTIVE'));
  console.log(chalk.gray('    This software is for evaluation purposes only.\n'));

  // Decorative line
  console.log(chalk.cyan('    ════════════════════════════════════════════════════════════════\n'));
}

export function printShutdownBanner(serviceName: string): void {
  console.log(chalk.yellow('\n'));
  console.log(chalk.yellow('    ╔══════════════════════════════════════════════════════════════╗'));
  console.log(chalk.yellow('    ║') + chalk.red(`  👋 ${serviceName.toUpperCase()} SHUTTING DOWN...                          `) + chalk.yellow('║'));
  console.log(chalk.yellow('    ╚══════════════════════════════════════════════════════════════╝\n'));
}

export function printGrpcCall(method: string, data?: any): void {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(
    chalk.gray(`[${timestamp}]`) + 
    chalk.cyan(' gRPC ') + 
    chalk.magenta('➜ ') + 
    chalk.white(method) +
    (data ? chalk.gray(` | ${JSON.stringify(data).substring(0, 60)}...`) : '')
  );
}

export function printSuccess(message: string): void {
  console.log(chalk.green(`    ✅ ${message}`));
}

export function printWarning(message: string): void {
  console.log(chalk.yellow(`    ⚠️  ${message}`));
}

export function printError(message: string): void {
  console.log(chalk.red(`    ❌ ${message}`));
}

export function printInfo(message: string): void {
  console.log(chalk.blue(`    ℹ️  ${message}`));
}
