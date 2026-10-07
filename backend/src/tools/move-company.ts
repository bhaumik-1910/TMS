import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/sequelize';
import { parseArgs } from 'node:util';
import { AppModule } from '../app.module.js';
import { AclService } from '../framework/acl/acl.service.js';
import { PRIMARY } from '../framework/tenancy/connection-registry.js';
import { CompanyMover } from '../framework/tenancy/move/move-company.js';
import { RefreshToken } from '../modules/platform/refresh-token.model.js';

/**
 * `npm run company:move -- --company 2 --to-schema tenant_shared [--to-db primary] [--keep-source]`
 * Moves one company to another schema or database, or merges it into one that holds other companies.
 * Signed-in sessions of the company are ended (new routing epoch, refresh tokens revoked).
 */
async function main() {
  const { values } = parseArgs({
    options: { company: { type: 'string' }, 'to-schema': { type: 'string' }, 'to-db': { type: 'string', default: PRIMARY }, 'keep-source': { type: 'boolean', default: false } },
  });
  const companyId = Number(values.company);
  const schema = values['to-schema'];
  if (!companyId || !schema) throw new Error('Usage: company:move --company <id> --to-schema <schema> [--to-db <dbKey>] [--keep-source]');
  const logger = new Logger('MoveCompany');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const report = await app.get(CompanyMover).move({ companyId, to: { dbKey: values['to-db'] as string, schema }, keepSource: values['keep-source'] as boolean });
  await app.get<typeof RefreshToken>(getModelToken(RefreshToken)).update({ revokedAt: new Date() }, { where: { companyId, revokedAt: null } });
  app.get(AclService).forgetCompany(companyId);
  logger.log(`Moved company ${companyId}: ${JSON.stringify(report.tables)}`);
  await app.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

