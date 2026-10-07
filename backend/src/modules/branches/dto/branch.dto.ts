import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsString()
  @Matches(/^[A-Za-z0-9_-]{2,20}$/, { message: 'Code: 2-20 letters, digits, - or _' })
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  stateCode?: string | null;

  @IsOptional()
  @IsBoolean()
  isHeadOffice?: boolean;

}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
