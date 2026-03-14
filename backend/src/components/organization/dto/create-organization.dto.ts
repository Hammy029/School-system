import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsObject,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SubscriptionStatus,
  Package,
} from '../entities/organization.schema';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  org_code?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  location?: Record<string, any>;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  subscriptionStatus?: SubscriptionStatus;

  @IsOptional()
  @IsEnum(Package)
  package?: Package;

  @IsOptional()
  @IsBoolean()
  hasMultipleBranches?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  maxBranches?: number;

  @IsOptional()
  @IsBoolean()
  allowSelfRegistration?: boolean;

  // Default admin fields
  @IsNotEmpty()
  @IsString()
  adminUsername: string;

  @IsNotEmpty()
  @IsEmail()
  adminEmail: string;

  @IsNotEmpty()
  @IsString()
  adminPhone: string;

  @IsOptional()
  @MinLength(6)
  adminPassword?: string;
}
