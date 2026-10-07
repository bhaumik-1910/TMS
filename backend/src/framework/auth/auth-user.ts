/**
 * Name of a data scope: `all`, `branch`, `own`, or one an app or a resource declares
 * (`active-only`). An unknown scope is denied, never treated as `all`.
 */
export type AclScope = string;

/** Authority limits of a grant: `{ amount: 5000 }`. An absent key is unlimited. */
export type Limits = Record<string, number>;

/** The signed-in user, rebuilt from the company token on every request. */
export interface AuthUser {
  /** The tenant-local user id: what audit columns, ACL and tenant joins use. */
  id: number;
  /** The control-plane identity id (`sub` of the token). */
  platformUserId: number;
  /** The partition: the company the token was issued for. */
  companyId: number;
  /** Routing epoch the token was issued under; a mismatch forces a new sign-in. */
  epoch: number;
  branchId: number | null;
  branchIds: number[];
  roleId: number | null;
  aclVersion: number;
  /** Driver or customer party for portal users; widens the `own` scope to that party's rows. */
  partyId: number | null;
  name: string;
}

/** What a controller hands its service: who is asking, how far the permission reaches, and its limits. */
export interface ReqCtx {
  user: AuthUser;
  scope: AclScope;
  /** Authority limits of the granted permission; checked before the steps run. */
  limits: Limits;
}
