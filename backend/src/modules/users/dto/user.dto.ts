import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import type { AclScope, Limits } from '../../../framework/auth/auth-user.js';
import { USER_TYPES, type UserType } from '../user.model.js';

export class CreateUserDto {
  @IsString()
  @Matches(/^[A-Za-z0-9/_-]{2,20}$/, { message: 'Code: 2-20 letters, digits, /, - or _' })
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @Type(() => Number)
  @IsInt()
  roleId: number;

  @Type(() => Number)
  @IsInt()
  branchId: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => Number)
  @IsInt({ each: true })
  branchIds?: number[];

  @IsOptional()
  @IsIn(USER_TYPES)
  userType?: UserType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  partyId?: number | null;

}

/** The email and password belong to the person's sign-in identity, not to one company: they are not edited here. */
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password', 'email'] as const)) {}

export class UserOverrideItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsIn(['grant', 'deny'])
  effect: 'grant' | 'deny';

  @IsString()
  @MaxLength(40)
  scope: AclScope;

  @IsOptional()
  @IsObject()
  limits?: Limits;
}

export class ReplaceOverridesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserOverrideItemDto)
  items: UserOverrideItemDto[];
}
