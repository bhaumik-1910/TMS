import { registerAs, type ConfigType } from '@nestjs/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
  databaseUri: required('DATABASE_URI'),
  dbSync: (process.env.DB_SYNC ?? 'none') as 'none' | 'alter',
  dbLogging: process.env.DB_LOGGING === 'true',
  jwtSecret: required('JWT_SECRET'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  /** How long the picker may stay open between the password and the company choice. */
  loginTokenTtl: process.env.LOGIN_TOKEN_TTL ?? '10m',
  /** A separate database for the control plane; unset: the primary one (schema `platform`). */
  controlDbUri: process.env.CONTROL_DB_URI || undefined,
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS ?? 30),
  erpTokenKey: required('ERP_TOKEN_KEY'),
  corsOrigins: (process.env.CORS_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean),
}));

export type AppConfig = ConfigType<typeof appConfig>;
