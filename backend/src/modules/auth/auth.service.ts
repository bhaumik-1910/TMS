import { ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { createHash, randomBytes } from 'node:crypto';
import { Op } from 'sequelize';
import { appConfig, type AppConfig } from '../../config/app.config.js';
import { AclService } from '../../framework/acl/acl.service.js';
import { Role } from '../../framework/acl/role.model.js';
import type { AuthUser } from '../../framework/auth/auth-user.js';
import { verifyPassword } from '../../framework/auth/password.js';
import { PlacementResolver } from '../../framework/tenancy/placement.js';
import { TenantRunner } from '../../framework/tenancy/tenant-runner.js';
import { Branch } from '../branches/branch.model.js';
import { Company } from '../companies/company.model.js';
import { MembershipService } from '../platform/memberships.service.js';
import { PlatformCompany } from '../platform/platform-company.model.js';
import { PlatformUser } from '../platform/platform-user.model.js';
import { RefreshToken } from '../platform/refresh-token.model.js';
import { UserBranch } from '../users/user-branch.model.js';
import { User } from '../users/user.model.js';
import type { AccessClaims, LoginClaims } from './claims.js';
import type { LoginDto } from './dto/auth.dto.js';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const INVALID = 'Invalid email or password';

/**
 * Two steps, like the other products on this framework: `login` checks the password against the
 * identity and returns a login token with the person's companies; `switchCompany` turns that into a
 * company token (and a refresh token bound to the company). Everything after that is tenant-scoped.
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject(appConfig.KEY) private readonly config: AppConfig,
    @InjectModel(PlatformUser) private readonly identities: typeof PlatformUser,
    @InjectModel(PlatformCompany) private readonly platformCompanies: typeof PlatformCompany,
    @InjectModel(RefreshToken) private readonly refreshTokens: typeof RefreshToken,
    private readonly memberships: MembershipService,
    private readonly runner: TenantRunner,
    private readonly placements: PlacementResolver,
    private readonly jwt: JwtService,
    private readonly acl: AclService,
  ) {}

  async login(dto: LoginDto) {
    const identity = await this.identities.findOne({ where: { email: dto.email.trim().toLowerCase() } });
    if (!identity || !(await verifyPassword(dto.password, identity.passwordHash))) throw new UnauthorizedException(INVALID);
    if (identity.status !== 'active') throw new UnauthorizedException(`Account is ${identity.status}`);
    await identity.update({ lastLoginAt: new Date() });
    const claims: LoginClaims = { sub: identity.id as number, typ: 'login' };
    const loginToken = await this.jwt.signAsync(claims, { expiresIn: this.config.loginTokenTtl as never });
    return { loginToken, user: { name: identity.name, email: identity.email }, companies: await this.companies(identity.id as number) };
  }

  /** The picker: the person's companies with their role there, license validity and last use. */
  async companies(platformUserId: number) {
    const list = await this.memberships.companiesOf(platformUserId);
    return Promise.all(
      list.map(async (company) => {
        const role = await this.roleIn(company.companyId, platformUserId).catch(() => null);
        return { ...company, role: role?.name ?? null, roleCode: role?.code ?? null, available: role !== null };
      }),
    );
  }

  private async roleIn(companyId: number, platformUserId: number): Promise<{ name: string; code: string } | null> {
    return this.runner.run({ companyId }, async () => {
      const user = await User.findOne({ where: { platformUserId }, include: [{ model: Role, attributes: ['name', 'code'] }] });
      return user && user.status === 'active' && user.role ? { name: user.role.name, code: user.role.code } : null;
    });
  }

  /** Opens one company for a signed-in identity: the checks below, then a company token and a refresh token. */
  async switchCompany(platformUserId: number, companyId: number, leaving?: string, userAgent?: string): Promise<TokenPair> {
    if (leaving) await this.logout(leaving);
    return this.open(platformUserId, companyId, userAgent);
  }

  /** Rotates: the presented token is revoked and a new pair returned for the same company. */
  async refresh(token: string, userAgent?: string): Promise<TokenPair> {
    const row = await this.refreshTokens.findOne({
      where: { tokenHash: sha256(token), revokedAt: null, expiresAt: { [Op.gt]: new Date() } },
    });
    if (!row) throw new UnauthorizedException('Session expired');
    await row.update({ revokedAt: new Date() });
    return this.open(row.platformUserId, row.companyId, userAgent);
  }

  async logout(token: string): Promise<void> {
    await this.refreshTokens.update({ revokedAt: new Date() }, { where: { tokenHash: sha256(token), revokedAt: null } });
  }

  private async open(platformUserId: number, companyId: number, userAgent?: string): Promise<TokenPair> {
    const [identity, link, company, license] = await Promise.all([
      this.identities.findByPk(platformUserId),
      this.memberships.membership(platformUserId, companyId),
      this.platformCompanies.findByPk(companyId),
      this.memberships.validLicense(companyId),
    ]);
    if (!identity || identity.status !== 'active') throw new UnauthorizedException('Session expired');
    if (!link || link.status !== 'active') throw new ForbiddenException('You do not have access to this company');
    if (link.accessExpiresAt && link.accessExpiresAt < new Date()) throw new ForbiddenException('Your access to this company has expired');
    if (!company || company.status !== 'active') throw new ForbiddenException('This company is not active');
    if (!license) throw new ForbiddenException('The license of this company has expired');

    const placement = await this.placements.resolve({ companyId });
    const claims = await this.runner.run({ companyId }, async (): Promise<AccessClaims> => {
      const user = await User.findOne({ where: { platformUserId } });
      if (!user) throw new ForbiddenException('You do not have a profile in this company');
      if (user.status !== 'active') throw new ForbiddenException(`Your account in this company is ${user.status}`);
      const [links, role] = await Promise.all([
        UserBranch.findAll({ where: { userId: user.id }, attributes: ['branchId'] }),
        user.roleId ? Role.findByPk(user.roleId, { attributes: ['aclVersion'] }) : null,
      ]);
      await user.update({ lastLoginAt: new Date() });
      return {
        sub: platformUserId,
        uid: user.id as number,
        cmp: companyId,
        ep: placement.epoch,
        br: user.branchId,
        brs: links.map((l) => l.branchId),
        role: user.roleId,
        av: role?.aclVersion ?? 0,
        pty: user.partyId,
        name: user.name,
        typ: 'access',
      };
    });

    const accessToken = await this.jwt.signAsync(claims);
    const refreshToken = randomBytes(32).toString('base64url');
    await this.refreshTokens.create({
      platformUserId,
      companyId,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + this.config.refreshTtlDays * 86_400_000),
      userAgent: userAgent?.slice(0, 255) ?? null,
    });
    await this.memberships.touch(platformUserId, companyId);
    return { accessToken, refreshToken };
  }

  /** Profile, company, branches and the effective permissions for the menu and buttons. */
  async me(authUser: AuthUser) {
    const [user, company, branches, effective] = await Promise.all([
      User.findByPk(authUser.id, { include: [{ model: Role, attributes: ['id', 'name', 'code'] }] }),
      Company.findByPk(authUser.companyId, { attributes: ['id', 'name', 'code', 'gstin'] }),
      Branch.findAll({
        where: { id: { [Op.in]: authUser.branchIds } },
        attributes: ['id', 'name', 'code', 'city'],
        order: [['name', 'ASC']],
      }),
      this.acl.effective(authUser),
    ]);
    if (!user) throw new UnauthorizedException('Account not found');
    const permissions: Record<string, string> = {};
    const limits: Record<string, Record<string, number>> = {};
    for (const [code, grant] of effective) {
      permissions[code] = grant.scope;
      if (Object.keys(grant.limits).length > 0) limits[code] = grant.limits;
    }
    return { user, company, branches, permissions, limits };
  }
}
