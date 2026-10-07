import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class SwitchCompanyDto {
  @IsInt()
  @Min(1)
  companyId: number;

  /** The refresh token of the company being left: it is revoked, so one device holds one session. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
