import { listStep } from '../../../../framework/crud/op-context.js';
import type { Role } from '../../../../framework/acl/role.model.js';

/** Adds `userCount` and `permissionCount` to each role of the page, one grouped query each. */
export default listStep<Role>({
  async after({ rows, sql: query }) {
    if (rows.length === 0) return;
    const ids = rows.map((row) => row.id);
    const group = async (sql: string) => {
      const found = await query<{ role_id: number; n: number }>(sql, { ids });
      return new Map(found.map((r) => [r.role_id, r.n]));
    };
    const users = await group('SELECT role_id, count(*)::int AS n FROM users WHERE role_id IN (:ids) GROUP BY role_id');
    const grants = await group('SELECT role_id, count(*)::int AS n FROM role_permissions WHERE role_id IN (:ids) GROUP BY role_id');
    for (const row of rows) {
      row.setDataValue('userCount' as never, (users.get(row.id as number) ?? 0) as never);
      row.setDataValue('permissionCount' as never, (grants.get(row.id as number) ?? 0) as never);
    }
  },
});
