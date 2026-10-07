import { UnauthorizedException } from '@nestjs/common';
import type { AuthUser } from '../../framework/auth/auth-user.js';

/** The company token: issued by `switch-company` (and `refresh`) for one company. */
export interface AccessClaims {
  /** Control-plane identity. */
  sub: number;
  /** Tenant-local user id. */
  uid: number;
  /** Company (the partition). */
  cmp: number;
  /** Routing epoch at issue time; a move bumps it and forces a new sign-in. */
  ep: number;
  br: number | null;
  brs: number[];
  role: number | null;
  av: number;
  pty: number | null;
  name: string;
  typ: 'access';
}

/** The short-lived token between the password check and the company choice. */
export interface LoginClaims {
  sub: number;
  typ: 'login';
}

/** `FrameworkOptions.auth.userClaims`: rebuilds the signed-in user from verified claims. */
export function userFromClaims(raw: Record<string, unknown>): AuthUser {
  const claims = raw as unknown as AccessClaims;
  if (typeof claims.uid !== 'number' || typeof claims.cmp !== 'number') throw new UnauthorizedException('Session expired');
  return {
    id: claims.uid,
    platformUserId: claims.sub,
    companyId: claims.cmp,
    epoch: claims.ep,
    branchId: claims.br,
    branchIds: claims.brs ?? [],
    roleId: claims.role,
    aclVersion: claims.av ?? 0,
    partyId: claims.pty,
    name: claims.name,
  };
}
