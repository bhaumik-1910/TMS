import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, type Transaction } from 'sequelize';
import { hashPassword } from '../../framework/auth/password.js';
import { CompanyLicense } from './company-license.model.js';
import { License } from './license.model.js';
import { PlatformCompany } from './platform-company.model.js';
import { PlatformUser } from './platform-user.model.js';
import { RefreshToken } from './refresh-token.model.js';
import { UserCompany } from './user-company.model.js';

export interface IdentityInput {
  email: string;
  name: string;
  /** Used only when the person has no identity yet; an existing identity keeps its own password. */
  password: string;
}

export interface Seats {
  used: number;
  max: number;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * The control-plane side of "who can sign in to which company". Tenant operations call it through
 * `c.control()` (a separate transaction on the control plane) in the pending-membership pattern:
 * identity and a `pending` membership first, the tenant user in `c.t`, then `activate` after commit.
 */
@Injectable()
export class MembershipService {
  constructor(
    @InjectModel(PlatformUser) private readonly users: typeof PlatformUser,
    @InjectModel(PlatformCompany) private readonly companies: typeof PlatformCompany,
    @InjectModel(UserCompany) private readonly links: typeof UserCompany,
    @InjectModel(RefreshToken) private readonly tokens: typeof RefreshToken,
    @InjectModel(CompanyLicense) private readonly companyLicenses: typeof CompanyLicense,
    @InjectModel(License) private readonly licenses: typeof License,
  ) { }

  /** The identity for `email`, created when new. Returns its id. */
  async ensureIdentity(t: Transaction, input: IdentityInput): Promise<number> {
    const email = input.email.trim().toLowerCase();
    const found = await this.users.findOne({ where: { email }, transaction: t });
    if (found) return found.id as number;
    const created = await this.users.create({ email, name: input.name, passwordHash: await hashPassword(input.password) }, { transaction: t });
    return created.id as number;
  }

  /** A membership that cannot sign in yet (`pending`); an existing one is left as it is. */
  async addPending(t: Transaction, companyId: number, platformUserId: number): Promise<void> {
    await this.links.findOrCreate({
      where: { platformUserId, companyId },
      defaults: { platformUserId, companyId, status: 'pending' } as never,
      transaction: t,
    });
  }

  /** Called after the tenant user committed. */
  async activate(companyId: number, platformUserId: number): Promise<void> {
    await this.links.update({ status: 'active' }, { where: { companyId, platformUserId, status: { [Op.in]: ['pending', 'invited'] } } });
  }

  async remove(companyId: number, platformUserId: number): Promise<void> {
    await this.revokeSessions(companyId, platformUserId);
    await this.links.destroy({ where: { companyId, platformUserId } });
  }

  async revokeSessions(companyId: number, platformUserId: number): Promise<void> {
    await this.tokens.update({ revokedAt: new Date() }, { where: { companyId, platformUserId, revokedAt: null } });
  }

  /** Active people against the license's seats. */
  async seats(companyId: number): Promise<Seats> {
    const [used, license] = await Promise.all([
      this.links.count({ where: { companyId, status: { [Op.in]: ['active', 'pending', 'invited'] } } }),
      this.validLicense(companyId),
    ]);
    const plan = license ? await this.licenses.findByPk(license.licenseId) : null;
    return { used, max: license?.seats ?? plan?.maxUsers ?? 0 };
  }

  /** The company's license that covers today, or null (expired, cancelled, none). */
  validLicense(companyId: number): Promise<CompanyLicense | null> {
    const day = today();
    return this.companyLicenses.findOne({
      where: { companyId, status: 'active', validFrom: { [Op.lte]: day }, validTo: { [Op.gte]: day } },
      order: [['validTo', 'DESC']],
    });
  }

  /** Memberships of a person with their company and license validity, for the picker. */
  async companiesOf(platformUserId: number) {
    const links = await this.links.findAll({ where: { platformUserId, status: 'active' }, order: [['lastUsedAt', 'DESC NULLS LAST'], ['id', 'ASC']] });
    if (links.length === 0) return [];
    const ids = links.map((link) => link.companyId);
    const [companies, licenses] = await Promise.all([
      this.companies.findAll({ where: { id: { [Op.in]: ids } } }),
      this.companyLicenses.findAll({ where: { companyId: { [Op.in]: ids }, status: 'active' }, order: [['validTo', 'DESC']] }),
    ]);
    const byCompany = new Map(companies.map((company) => [company.id as number, company]));
    const licenseOf = new Map<number, CompanyLicense>();
    for (const license of licenses) if (!licenseOf.has(license.companyId)) licenseOf.set(license.companyId, license);
    return links.flatMap((link) => {
      const company = byCompany.get(link.companyId);
      if (!company) return [];
      const license = licenseOf.get(link.companyId);
      return [
        {
          companyId: link.companyId,
          code: company.code,
          name: company.name,
          status: company.status,
          isDefault: link.isDefault,
          lastUsedAt: link.lastUsedAt,
          accessExpiresAt: link.accessExpiresAt,
          licenseValidTo: license?.validTo ?? null,
          licenseValid: !!license && license.validFrom <= today() && license.validTo >= today(),
        },
      ];
    });
  }

  async membership(platformUserId: number, companyId: number): Promise<UserCompany | null> {
    return this.links.findOne({ where: { platformUserId, companyId } });
  }

  async touch(platformUserId: number, companyId: number): Promise<void> {
    await this.links.update({ lastUsedAt: new Date() }, { where: { platformUserId, companyId } });
  }
}
