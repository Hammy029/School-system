import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import {
  BranchType,
  BranchStatus,
} from '../entities/organization-branch.schema';

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BranchType)
  type?: BranchType;

  @IsOptional()
  @IsEnum(BranchStatus)
  status?: BranchStatus;

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
  @IsMongoId()
  managerId?: string;

  @IsOptional()
  @IsBoolean()
  isOperational?: boolean;

  @IsOptional()
  @IsBoolean()
  isMainBranch?: boolean;
}
