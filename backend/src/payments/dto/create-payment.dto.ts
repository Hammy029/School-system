import { IsString, IsNumber, IsOptional, IsMongoId, IsEnum, IsDateString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsMongoId()
  studentId!: string;

  @IsString()
  academicYear!: string;

  @IsEnum(['Term 1', 'Term 2', 'Term 3'])
  term!: string;

  @IsEnum(['tuition', 'transport', 'boarding', 'uniform', 'books', 'exam', 'other'])
  feeType!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNumber()
  @Min(0)
  amountPaid!: number;

  @IsString()
  @IsOptional()
  receiptNumber?: string;

  @IsEnum(['cash', 'bank_transfer', 'mpesa', 'cheque', 'other'])
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateFeeStructureDto {
  @IsMongoId()
  @IsOptional()
  classId?: string;

  @IsString()
  academicYear!: string;

  @IsEnum(['Term 1', 'Term 2', 'Term 3'])
  term!: string;

  @IsEnum(['tuition', 'transport', 'boarding', 'uniform', 'books', 'exam', 'other'])
  feeType!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
