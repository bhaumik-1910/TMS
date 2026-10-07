import { type DynamicModule, Global, Module, type InjectionToken, type ModuleMetadata, type OptionalFactoryDependency } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClsModule } from 'nestjs-cls';
import { AclService } from './acl/acl.service.js';
import { PermissionMeta } from './acl/limits.js';
import { PermissionCatalogService } from './acl/permission-catalog.service.js';
import { PermissionGuard } from './acl/permission.guard.js';
import { Permission } from './acl/permission.model.js';
import { RolePermission } from './acl/role-permission.model.js';
import { Role } from './acl/role.model.js';
import { UserPermissionOverride } from './acl/user-permission-override.model.js';
import { EntityEvent } from './audit/entity-event.model.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';
import { FrameworkBoot } from './framework-boot.service.js';
import { Notifier } from './notify/notifier.service.js';
import { FRAMEWORK_OPTIONS, type FrameworkOptions } from './options.js';
import { PeriodLock } from './period/period-lock.model.js';
import { PeriodLockService } from './period/period-lock.service.js';
import { PeriodController } from './period/period.controller.js';
import { DocumentNumberService } from './sequences/document-number.service.js';
import { DocumentSequence } from './sequences/document-sequence.model.js';
import { CompanySetting } from './settings/company-setting.model.js';
import { SettingsController } from './settings/settings.controller.js';
import { SettingsService } from './settings/settings.service.js';
import { ConnectionRegistry } from './tenancy/connection-registry.js';
import { TenantRouting } from './tenancy/control/tenant-routing.model.js';
import { TenantShard } from './tenancy/control/tenant-shard.model.js';
import { TenantLifecycle } from './tenancy/lifecycle.js';
import { CompanyMover } from './tenancy/move/move-company.js';
import { PlacementResolver } from './tenancy/placement.js';
import { SchemaSync } from './tenancy/schema-sync.js';
import { TenantContextGuard } from './tenancy/tenant-context.guard.js';
import { ControlPlane, TenantDb } from './tenancy/tenant-db.js';
import { TenantRunner } from './tenancy/tenant-runner.js';

/** Models the framework owns. The app registers its own with `SequelizeModule.forFeature`. */
export const FRAMEWORK_MODELS = [
  Permission,
  Role,
  RolePermission,
  UserPermissionOverride,
  EntityEvent,
  DocumentSequence,
  PeriodLock,
  CompanySetting,
  TenantRouting,
  TenantShard,
];

const SERVICES = [
  ConnectionRegistry,
  PlacementResolver,
  SchemaSync,
  TenantRunner,
  TenantLifecycle,
  CompanyMover,
  TenantDb,
  ControlPlane,
  AclService,
  PermissionMeta,
  PermissionCatalogService,
  PeriodLockService,
  SettingsService,
  DocumentNumberService,
  Notifier,
  JwtAuthGuard,
  TenantContextGuard,
  PermissionGuard,
];

export interface FrameworkAsyncOptions {
  imports?: ModuleMetadata['imports'];
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (...args: never[]) => FrameworkOptions | Promise<FrameworkOptions>;
}

/**
 * The ops framework: tenancy (partition, placement, control plane), sign-in verification, ACL with
 * scopes and limits, audit, period locks, settings, document numbers. It knows nothing about what
 * the app stores; the app passes its catalog, scopes, settings and token claims in the options.
 * Needs a global `JwtService` (the app's auth module) to verify tokens.
 *
 * Guards run in this order for every route: sign-in, tenant context, permission.
 */
@Global()
@Module({})
export class FrameworkModule {
  static forRootAsync(options: FrameworkAsyncOptions): DynamicModule {
    return {
      module: FrameworkModule,
      global: true,
      imports: [ClsModule.forRoot({ global: true, middleware: { mount: true } }), SequelizeModule.forFeature(FRAMEWORK_MODELS), ...(options.imports ?? [])],
      controllers: [PeriodController, SettingsController],
      providers: [
        { provide: FRAMEWORK_OPTIONS, useFactory: options.useFactory, inject: options.inject ?? [] },
        ...SERVICES,
        FrameworkBoot,
        { provide: APP_GUARD, useExisting: JwtAuthGuard },
        { provide: APP_GUARD, useExisting: TenantContextGuard },
        { provide: APP_GUARD, useExisting: PermissionGuard },
      ],
      exports: [FRAMEWORK_OPTIONS, SequelizeModule, ...SERVICES],
    };
  }
}
