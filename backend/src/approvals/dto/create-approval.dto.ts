import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';

export class CreateApprovalStepDto {
  @IsEnum(['teacher', 'hod', 'deputy', 'principal', 'admin'])
  role!: string;
}

export class CreateApprovalDto {
  @IsEnum(['results', 'report', 'fee_waiver', 'student_transfer', 'other'])
  type!: string;

  @IsString()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsArray()
  steps!: CreateApprovalStepDto[];
}

export class ApproveRejectDto {
  @IsEnum(['approved', 'rejected'])
  action!: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
