import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsBoolean, Min } from 'class-validator';

export class CreateTimeEntryDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsBoolean()
  @IsOptional()
  billable?: boolean;
}
