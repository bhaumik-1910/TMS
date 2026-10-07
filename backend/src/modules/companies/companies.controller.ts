import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CompanyProvisioner, type ProvisionInput, SHARED_SCHEMA } from './company.provisioner.js';
import { InjectModel } from '@nestjs/sequelize';
import { PlatformCompany } from '../platform/platform-company.model.js';
import { TenantRouting } from '../../framework/tenancy/control/tenant-routing.model.js';
import { Public } from '../../framework/auth/decorators.js';

export class CreateCompanyDto {
  name: string;
  code: string;
  gstin?: string;
  dedicatedSchema?: boolean;
  schema?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
  branches?: Array<{ code: string; name: string; city?: string; stateCode?: string; isHeadOffice?: boolean }>;
}

@Controller(['companies', 'api/companies', 'api/v1/companies'])
export class CompaniesController {
  constructor(
    private readonly provisioner: CompanyProvisioner,
    @InjectModel(PlatformCompany) private readonly platformCompanies: typeof PlatformCompany,
    @InjectModel(TenantRouting) private readonly routing: typeof TenantRouting,
  ) {}

  /** List all platform companies and their schema routing */
  @Public()
  @Get()
  async listCompanies() {
    const companies = await this.platformCompanies.findAll({
      order: [['id', 'ASC']],
    });
    const routings = await this.routing.findAll();
    const routeMap = new Map(routings.map((r) => [r.companyId, r]));

    return companies.map((c) => {
      const route = routeMap.get(c.id as number);
      return {
        id: c.id,
        name: c.name,
        code: c.code,
        gstin: c.gstin,
        schema: route?.schema ?? SHARED_SCHEMA,
        dbKey: route?.dbKey ?? 'primary',
        status: route?.status ?? 'active',
        createdAt: c.createdAt,
      };
    });
  }

  /**
   * Provision a new organization. If `dedicatedSchema` is true, automatically creates
   * a dedicated schema (e.g. `tenant_<code/schema>`) and synchronizes all tenant tables.
   */
  @Public()
  @Post('provision')
  async provisionCompany(@Body() dto: CreateCompanyDto) {
    const code = dto.code.toLowerCase().trim();
    const schema = dto.dedicatedSchema
      ? (dto.schema || `tenant_${code}`)
      : (dto.schema || SHARED_SCHEMA);

    const input: ProvisionInput = {
      name: dto.name.trim(),
      code,
      gstin: dto.gstin?.trim() ?? null,
      schema,
      license: { code: 'standard', days: 365, seats: 25 },
      branches: dto.branches?.length
        ? dto.branches
        : [{ code: 'HO', name: `${dto.name} Head Office`, isHeadOffice: true }],
      admin: {
        code: 'ADMIN',
        name: dto.adminName || 'Admin',
        email: (dto.adminEmail || `admin@${code}.test`).toLowerCase().trim(),
        password: dto.adminPassword || 'Demo@1234',
      },
    };

    try {
      const result = await this.provisioner.provision(input);
      return {
        success: true,
        companyId: result.companyId,
        code,
        name: dto.name,
        schema,
        adminId: result.adminId,
        branchCount: result.branchIds.size,
        message: `Organization "${dto.name}" provisioned successfully in schema "${schema}".`,
      };
    } catch (err: any) {
      console.error('Provisioning error stack:', err?.message || err);
      return {
        success: false,
        error: err?.message || 'Provisioning failed',
      };
    }
  }
}
