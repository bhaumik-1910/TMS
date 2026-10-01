import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDemoRequestDto {
  @ApiProperty({ example: 'Marcus' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Vance' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'Apex Logistics Corp' })
  @IsString()
  @IsNotEmpty()
  company: string;

  @ApiProperty({ example: 'marcus@apexlogistics.com' })
  @IsEmail()
  businessEmail: string;

  @ApiProperty({ example: '+1 (555) 234-5678' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '50-250 employees', required: false })
  @IsString()
  @IsOptional()
  companySize?: string;

  @ApiProperty({ example: '25-100 trucks', required: false })
  @IsString()
  @IsOptional()
  fleetSize?: string;

  @ApiProperty({ example: 'United States', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'Looking to optimize linehaul dispatch and live GPS tracking.', required: false })
  @IsString()
  @IsOptional()
  message?: string;
}
