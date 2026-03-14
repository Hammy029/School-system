import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto, CreateFeeStructureDto } from './create-payment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
export class UpdateFeeStructureDto extends PartialType(CreateFeeStructureDto) {}
