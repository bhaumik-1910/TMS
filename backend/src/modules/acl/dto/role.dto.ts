import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import type { AclScope, Limits } from '../../../framework/auth/auth-user.js';

export class RolePermissionItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  /** A scope id the permission's resource offers (checked against the catalog). */
  @IsString()
  @MaxLength(40)
  scope: AclScope;

  /** Authority limits such as `{ amount: 5000 }`; keys must be ones the permission declares. */
  @IsOptional()
  @IsObject()
  limits?: Limits;
}

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_]{2,40}$/, { message: 'Code: 2-40 letters, digits or _' })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionItemDto)
  permissions?: RolePermissionItemDto[];
}

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class ReplacePermissionsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RolePermissionItemDto)
  items: RolePermissionItemDto[];
}
