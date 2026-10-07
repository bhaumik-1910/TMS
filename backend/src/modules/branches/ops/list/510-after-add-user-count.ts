import { listStep } from '../../../../framework/crud/op-context.js';
import type { Branch } from '../../branch.model.js';

/**
 * List decoration: adds `activeUserCount` to every row of the page with ONE grouped query
 * (never one query per row). Runs for the plain list and for every `list-<view>`.
 */
export default listStep<Branch>({
  async after({ rows, sql }) {
    if (rows.length === 0) return;
    const counts = await sql<{ branch_id: number; n: number }>(
      `SELECT branch_id, count(*)::int AS n FROM users WHERE status = 'active' AND branch_id IN (:ids) GROUP BY branch_id`,
      { ids: rows.map((row) => row.id) },
    );
    const byBranch = new Map(counts.map((c) => [c.branch_id, c.n]));
    for (const row of rows) row.setDataValue('activeUserCount' as never, (byBranch.get(row.id as number) ?? 0) as never);
  },
});
