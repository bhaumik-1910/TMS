/**
 * The tenant partition: which column marks a row as belonging to one tenant (company) inside a
 * database. Always on, also in a dedicated schema or database that holds a single company, so a
 * company can move between placements without its rows changing.
 *
 * Model classes read this when they are declared, so an app that wants another name calls
 * `definePartition()` before it imports any model (a side-effect import at the top of `main.ts`
 * and the seed entry). The defaults are what TMS and the ERP backend both use.
 */
export interface PartitionConfig {
  /** Attribute name on models and on `AuthUser`. */
  field: string;
  /** Column name. */
  column: string;
  /** Table of the per-schema tenant mirror the partition column references. */
  mirror: string;
}

export const PARTITION: PartitionConfig = { field: 'companyId', column: 'company_id', mirror: 'companies' };

export function definePartition(config: Partial<PartitionConfig>): void {
  Object.assign(PARTITION, config);
}

/** The partition value of a user, a row or any object that carries the partition field. */
export function partitionValue(source: object): number {
  return (source as Record<string, number>)[PARTITION.field] as number;
}
