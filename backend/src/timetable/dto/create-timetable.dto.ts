import { IsString, IsOptional, IsArray, ValidateNested, IsMongoId, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class TimetableSlotDto {
  @IsEnum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
  day!: string;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsMongoId()
  subjectId!: string;

  @IsMongoId()
  @IsOptional()
  teacherId?: string;

  @IsString()
  @IsOptional()
  room?: string;
}

export class CreateTimetableDto {
  @IsMongoId()
  classId!: string;

  @IsString()
  academicYear!: string;

  @IsEnum(['Term 1', 'Term 2', 'Term 3'])
  term!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimetableSlotDto)
  slots!: TimetableSlotDto[];
}
