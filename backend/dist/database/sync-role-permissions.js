"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv = require("dotenv");
const path = require("path");
const models_1 = require("./models");
const roles_permissions_constant_1 = require("../common/constants/roles-permissions.constant");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
async function syncRolePermissions() {
    console.log('🔄 Starting Role & Permission Synchronization with Sequelize...');
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not defined');
        process.exit(1);
    }
    const sequelize = new sequelize_typescript_1.Sequelize(dbUrl, {
        dialect: 'postgres',
        models: models_1.ALL_MODELS,
        logging: false,
    });
    try {
        await sequelize.authenticate();
        const allNeededPerms = new Set();
        for (const [roleName, perms] of Object.entries(roles_permissions_constant_1.DEFAULT_ROLE_PERMISSIONS)) {
            if (roleName === 'SUPER_ADMIN')
                continue;
            for (const p of perms) {
                if (p !== '*') {
                    allNeededPerms.add(p);
                }
            }
        }
        const permMap = new Map();
        for (const permKey of allNeededPerms) {
            const parts = permKey.split(':');
            const module = parts[0] || 'general';
            const action = parts[1] || 'access';
            let perm = await models_1.PermissionModel.findOne({ where: { key: permKey } });
            if (!perm) {
                perm = await models_1.PermissionModel.create({
                    key: permKey,
                    module,
                    action,
                    description: `Permission for ${module} ${action}`,
                });
            }
            permMap.set(permKey, perm.id);
        }
        console.log(`✅ Upserted ${permMap.size} distinct permissions into PostgreSQL.`);
        for (const [roleName, perms] of Object.entries(roles_permissions_constant_1.DEFAULT_ROLE_PERMISSIONS)) {
            let role = await models_1.RoleModel.findOne({ where: { name: roleName } });
            if (!role) {
                role = await models_1.RoleModel.create({
                    name: roleName,
                    description: `Standard TMS Enterprise role for ${roleName}`,
                });
            }
            if (roleName === 'SUPER_ADMIN' || roleName === 'TMS_ADMIN') {
                for (const [key, pId] of permMap.entries()) {
                    const exists = await models_1.RolePermissionModel.findOne({
                        where: { roleId: role.id, permissionId: pId },
                    });
                    if (!exists) {
                        await models_1.RolePermissionModel.create({ roleId: role.id, permissionId: pId });
                    }
                }
                console.log(`✅ Synced ${roleName} with full permissions.`);
                continue;
            }
            let linkedCount = 0;
            for (const p of perms) {
                const pId = permMap.get(p);
                if (pId) {
                    const exists = await models_1.RolePermissionModel.findOne({
                        where: { roleId: role.id, permissionId: pId },
                    });
                    if (!exists) {
                        await models_1.RolePermissionModel.create({ roleId: role.id, permissionId: pId });
                    }
                    linkedCount++;
                }
            }
            console.log(`✅ Role ${roleName}: linked ${linkedCount} permissions.`);
        }
        console.log('🎉 Role Permission Synchronization Complete!');
    }
    finally {
        await sequelize.close();
    }
}
syncRolePermissions().catch((err) => {
    console.error('❌ Error syncing role permissions:', err);
    process.exit(1);
});
//# sourceMappingURL=sync-role-permissions.js.map