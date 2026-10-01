/**
 * Enterprise TMS Data Access Scopes
 */
export enum DataScope {
  SYSTEM = 'SYSTEM',                 // System-wide unrestricted platform governance (Super Admin)
  ORGANIZATION = 'ORGANIZATION',     // All records belonging to authenticated organization (TMS Admin, Ops Mgr, Planner)
  TEAM = 'TEAM',                     // Records within operational dispatch/planning team
  SELF = 'SELF',                     // Records owned or created by user
  ASSIGNED = 'ASSIGNED',             // Records directly assigned to user (Dispatcher active board, etc.)
  CUSTOMER = 'CUSTOMER',             // Records belonging exclusively to customer entity
  CARRIER = 'CARRIER',               // Records contracted to carrier entity
  DRIVER = 'DRIVER',                 // Records assigned to active driver profile
  RESOURCE_OWNER = 'RESOURCE_OWNER', // Record owner based on user ID
}
