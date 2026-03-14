import { IsString, IsArray, IsMongoId, IsEnum } from 'class-validator';

export class GenerateTimetableDto {
  @IsMongoId()
  classId!: string;

  @IsString()
  academicYear!: string;

  @IsEnum(['Term 1', 'Term 2', 'Term 3'])
  term!: string;

  @IsArray()
  @IsMongoId({ each: true })
  subjectIds!: string[];

  @IsArray()
  @IsString({ each: true })
  days!: string[];

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  slotDuration!: string;

  @IsString()
  breakTime!: string;

  @IsString()
  breakDuration!: string;
}
