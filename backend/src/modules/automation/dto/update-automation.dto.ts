import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateAutomationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  triggerType?: string;

  @IsOptional()
  triggerConfig?: any;

  @IsOptional()
  conditions?: any;

  @IsOptional()
  actions?: any;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  errorHandling?: any;
}
