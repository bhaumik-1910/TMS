import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PRIMARY } from '../../framework/tenancy/connection-registry.js';
import { ControlPlane, TenantDb } from '../../framework/tenancy/tenant-db.js';
import { TenantLifecycle } from '../../framework/tenancy/lifecycle.js';
import { RolePermissionsService } from '../acl/role-permissions.service.js';
import { Branch } from '../branches/branch.model.js';
import { MembershipService } from '../platform/memberships.service.js';
import { CompanyLicense } from '../platform/company-license.model.js';
import { License } from '../platform/license.model.js';
import { PlatformCompany } from '../platform/platform-company.model.js';
import { UserBranch } from '../users/user-branch.model.js';
import { User } from '../users/user.model.js';
import { Company } from './company.model.js';

export const SHARED_SCHEMA = 'tenant_shared';

export interface ProvisionInput {
  name: string;
  code: string;
  gstin?: string | null;
  /** Schema for this company's rows. Default: the shared schema (many companies, one set of tables). */
  schema?: string;
  /** Code of a plan in `licenses`; the company gets it for `licenseDays` days. None: the company cannot open. */
  license?: { code: string; days?: number; seats?: number };
  branches: Array<{ code: string; name: string; city?: string; stateCode?: string; isHeadOffice?: boolean }>;
  admin: { code: string; name: string; email: string; password: string };
}

export interface ProvisionResult {
  companyId: number;
  branchIds: Map<string, number>;
  roleIds: Map<string, number>;
  adminId: number;
}

/**
 * Creates a company end to end: the control-plane records (company, license, the admin's identity
 * and a `pending` membership), the tenant place (schema, tables, catalog, routing), then inside it
 * the company mirror, branches, default roles and the admin. The membership turns `active` last,
 * so a failure anywhere leaves nobody able to sign in to a half-built company.
 */
@Injectable()
export class CompanyProvisioner {
  constructor(
    @InjectModel(PlatformCompany) private readonly platformCompanies: typeof PlatformCompany,
    @InjectModel(License) private readonly licenses: typeof License,
    @InjectModel(CompanyLicense) private readonly companyLicenses: typeof CompanyLicense,
    private readonly control: ControlPlane,
    private readonly lifecycle: TenantLifecycle,
    private readonly db: TenantDb,
    private readonly memberships: MembershipService,
    private readonly roles: RolePermissionsService,
  ) { }

  async provision(input: ProvisionInput): Promise<ProvisionResult> {
    const { companyId, adminIdentityId } = await this.control.tx(async (t) => {
      const company = await this.platformCompanies.create(
        { name: input.name, code: input.code.toLowerCase(), gstin: input.gstin ?? null },
        { transaction: t },
      );
      if (input.license) {
        const plan = await this.licenses.findOne({ where: { code: input.license.code }, transaction: t });
        if (!plan) throw new Error(`Unknown license ${input.license.code}`);
        const today = new Date();
        const until = new Date(today.getTime() + (input.license.days ?? 365) * 86_400_000);
        await this.companyLicenses.create(
          { companyId: company.id, licenseId: plan.id, seats: input.license.seats ?? null, validFrom: today.toISOString().slice(0, 10), validTo: until.toISOString().slice(0, 10) },
          { transaction: t },
        );
      }
      const identity = await this.memberships.ensureIdentity(t, { email: input.admin.email, name: input.admin.name, password: input.admin.password });
      await this.memberships.addPending(t, company.id as number, identity);
      return { companyId: company.id as number, adminIdentityId: identity };
    });

    const out: ProvisionResult = { companyId, branchIds: new Map(), roleIds: new Map(), adminId: 0 };
    await this.lifecycle.provision({
      ref: { companyId },
      placement: { dbKey: PRIMARY, schema: input.schema ?? SHARED_SCHEMA },
      seed: () =>
        this.db.tx(async (t) => {
          await Company.create({ id: companyId, name: input.name, code: input.code.toLowerCase(), gstin: input.gstin ?? null } as never, { transaction: t });
          const branches = await Branch.bulkCreate(
            input.branches.map((branch) => ({ ...branch, code: branch.code.toUpperCase(), companyId })) as never[],
            { transaction: t, returning: true },
          );
          for (const branch of branches) out.branchIds.set(branch.code, branch.id as number);
          const roleIds = await this.roles.seedDefaults(companyId, t);
          for (const [code, id] of roleIds) out.roleIds.set(code, id);
          const headOffice = branches.find((branch) => branch.isHeadOffice) ?? branches[0];
          const admin = await User.create(
            {
              companyId,
              code: input.admin.code,
              name: input.admin.name,
              email: input.admin.email.toLowerCase(),
              platformUserId: adminIdentityId,
              roleId: roleIds.get('ADMIN'),
              branchId: headOffice?.id ?? null,
              status: 'active',
            } as never,
            { transaction: t },
          );
          out.adminId = admin.id as number;
          await UserBranch.bulkCreate(branches.map((branch) => ({ companyId, userId: admin.id, branchId: branch.id })) as never[], { transaction: t });
        }),
    });
    await this.memberships.activate(companyId, adminIdentityId);
    return out;
  }
}
