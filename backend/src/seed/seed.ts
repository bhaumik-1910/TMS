import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AppModule } from '../app.module.js';
import { PRIMARY } from '../framework/tenancy/connection-registry.js';
import { quoteIdent } from '../framework/tenancy/context.js';
import { SchemaSync } from '../framework/tenancy/schema-sync.js';
import { TenantRunner } from '../framework/tenancy/tenant-runner.js';
import { ControlPlane, TenantDb } from '../framework/tenancy/tenant-db.js';
import { TenantShard } from '../framework/tenancy/control/tenant-shard.model.js';
import { CompanyProvisioner, SHARED_SCHEMA, type ProvisionResult } from '../modules/companies/company.provisioner.js';
import { License } from '../modules/platform/license.model.js';
import { MembershipService } from '../modules/platform/memberships.service.js';
import { UserBranch } from '../modules/users/user-branch.model.js';
import { User } from '../modules/users/user.model.js';
import { DEMO2_TENANT, DEMO3_TENANT, DEMO_PASSWORD, DEMO_TENANT, DEMO_USERS } from './demo-tenant.js';

const SCHEMAS = ['platform', SHARED_SCHEMA, DEMO2_TENANT.schema as string, DEMO3_TENANT.schema as string];

/** `npm run db:reset`: drop everything, recreate the platform and tenant schemas, seed demo companies. Dev only. */
async function main() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const sequelize = app.get(Sequelize);

  logger.log('Dropping schemas');
  await sequelize.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  for (const schema of SCHEMAS) await sequelize.query(`DROP SCHEMA IF EXISTS ${quoteIdent(schema)} CASCADE`);

  await app.get(SchemaSync).syncControl();
  await app.get(ControlPlane).tx(async (t) => {
    await app.get<typeof License>(getModelToken(License)).create({ code: 'standard', name: 'Standard', maxUsers: 25 }, { transaction: t });
    await app.get<typeof TenantShard>(getModelToken(TenantShard)).create({ dbKey: PRIMARY, type: 'cloud', status: 'active', connectionUri: null }, { transaction: t });
  });

  const provisioner = app.get(CompanyProvisioner);
  const demo = await provisioner.provision(DEMO_TENANT);
  const demo2 = await provisioner.provision(DEMO2_TENANT);
  const demo3 = await provisioner.provision(DEMO3_TENANT);
  logger.log(`Company "${DEMO_TENANT.code}": ${demo.branchIds.size} branches in ${SHARED_SCHEMA}`);
  logger.log(`Company "${DEMO2_TENANT.code}": ${demo2.branchIds.size} branches in ${DEMO2_TENANT.schema}`);
  logger.log(`Company "${DEMO3_TENANT.code}": ${demo3.branchIds.size} branches in ${DEMO3_TENANT.schema}`);

  await seedDemoUsers(app.get(MembershipService), app.get(ControlPlane), app.get(TenantRunner), app.get(TenantDb), demo);
  await seedPartnerInDemo3(app.get(MembershipService), app.get(ControlPlane), app.get(TenantRunner), app.get(TenantDb), demo3);

  logger.log(`Sign in Admin: admin@demo.test / ${DEMO_PASSWORD} (3 companies: demo, demo2, swift)`);
  logger.log(`Sign in Partner: partner@demo.test / ${DEMO_PASSWORD} (2 companies: demo, swift)`);
  logger.log(`Sign in Manager: manager@demo.test / ${DEMO_PASSWORD} (1 company: demo)`);
  await app.close();
}


/** One login per default role in the first company. Same pending-then-active order as the users module. */
async function seedDemoUsers(memberships: MembershipService, control: ControlPlane, runner: TenantRunner, db: TenantDb, demo: ProvisionResult) {
  for (const spec of DEMO_USERS) {
    const platformUserId = await control.tx(async (t) => {
      const id = await memberships.ensureIdentity(t, { email: spec.email, name: spec.name, password: DEMO_PASSWORD });
      await memberships.addPending(t, demo.companyId, id);
      return id;
    });
    await runner.run({ companyId: demo.companyId }, () =>
      db.tx(async (t) => {
        const branchId = demo.branchIds.get(spec.branch);
        const user = await User.create(
          { code: spec.code, name: spec.name, email: spec.email, platformUserId, roleId: demo.roleIds.get(spec.role), branchId, status: 'active', createdById: demo.adminId } as never,
          { transaction: t },
        );
        await UserBranch.create({ userId: user.id, branchId } as never, { transaction: t });
      }),
    );
    await memberships.activate(demo.companyId, platformUserId);
  }
}

/** Link the partner user to Swift Logistics (demo3) as Branch Manager in Bangalore */
async function seedPartnerInDemo3(memberships: MembershipService, control: ControlPlane, runner: TenantRunner, db: TenantDb, demo3: ProvisionResult) {
  const partnerEmail = 'partner@demo.test';
  const partnerName = 'Karan Sharma';
  const platformUserId = await control.tx(async (t) => {
    const id = await memberships.ensureIdentity(t, { email: partnerEmail, name: partnerName, password: DEMO_PASSWORD });
    await memberships.addPending(t, demo3.companyId, id);
    return id;
  });
  await runner.run({ companyId: demo3.companyId }, () =>
    db.tx(async (t) => {
      const branchId = demo3.branchIds.get('BLR');
      const user = await User.create(
        { code: 'BLR_MGR', name: partnerName, email: partnerEmail, platformUserId, roleId: demo3.roleIds.get('BRANCH_MANAGER'), branchId, status: 'active', createdById: demo3.adminId } as never,
        { transaction: t },
      );
      await UserBranch.create({ userId: user.id, branchId } as never, { transaction: t });
    }),
  );
  await memberships.activate(demo3.companyId, platformUserId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


