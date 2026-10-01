import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { ALL_MODELS, RoleModel, PermissionModel, RolePermissionModel } from './models';
import { DEFAULT_ROLE_PERMISSIONS } from '../common/constants/roles-permissions.constant';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function syncRolePermissions() {
  console.log('🔄 Starting Role & Permission Synchronization with Sequelize...');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not defined');
    process.exit(1);
  }

  const sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    models: ALL_MODELS,
    logging: false,
  });

  try {
    await sequelize.authenticate();

    // 1. Gather all unique permissions across all 13 roles
    const allNeededPerms = new Set<string>();
    for (const [roleName, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      if (roleName === 'SUPER_ADMIN') continue;
      for (const p of perms) {
        if (p !== '*') {
          allNeededPerms.add(p);
        }
      }
    }

    // 2. Upsert each permission into DB
    const permMap = new Map<string, string>();
    for (const permKey of allNeededPerms) {
      const parts = permKey.split(':');
      const module = parts[0] || 'general';
      const action = parts[1] || 'access';

      let perm = await PermissionModel.findOne({ where: { key: permKey } });
      if (!perm) {
        perm = await PermissionModel.create({
          key: permKey,
          module,
          action,
          description: `Permission for ${module} ${action}`,
        });
      }
      permMap.set(permKey, perm.id);
    }
    console.log(`✅ Upserted ${permMap.size} distinct permissions into PostgreSQL.`);

    // 3. For each role, upsert Role record & link permissions
    for (const [roleName, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      let role = await RoleModel.findOne({ where: { name: roleName } });
      if (!role) {
        role = await RoleModel.create({
          name: roleName,
          description: `Standard TMS Enterprise role for ${roleName}`,
        });
      }

      if (roleName === 'SUPER_ADMIN' || roleName === 'TMS_ADMIN') {
        for (const [key, pId] of permMap.entries()) {
          const exists = await RolePermissionModel.findOne({
            where: { roleId: role.id, permissionId: pId },
          });
          if (!exists) {
            await RolePermissionModel.create({ roleId: role.id, permissionId: pId });
          }
        }
        console.log(`✅ Synced ${roleName} with full permissions.`);
        continue;
      }

      let linkedCount = 0;
      for (const p of perms) {
        const pId = permMap.get(p);
        if (pId) {
          const exists = await RolePermissionModel.findOne({
            where: { roleId: role.id, permissionId: pId },
          });
          if (!exists) {
            await RolePermissionModel.create({ roleId: role.id, permissionId: pId });
          }
          linkedCount++;
        }
      }
      console.log(`✅ Role ${roleName}: linked ${linkedCount} permissions.`);
    }

    console.log('🎉 Role Permission Synchronization Complete!');
  } finally {
    await sequelize.close();
  }
}

syncRolePermissions().catch((err) => {
  console.error('❌ Error syncing role permissions:', err);
  process.exit(1);
});
