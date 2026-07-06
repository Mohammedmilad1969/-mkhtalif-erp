import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  requestType?: string;

  @IsString()
  @IsOptional()
  clarityLevel?: string;

  @IsString()
  @IsOptional()
  budgetLevel?: string;

  @IsString()
  @IsOptional()
  opportunitySize?: string;

  @IsString()
  @IsOptional()
  nextAction?: string;

  @IsString()
  @IsOptional()
  nextActionDate?: string;

  @IsString()
  @IsOptional()
  stageId?: string;

  @IsString()
  @IsOptional()
  sopId?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;

  @IsString()
  @IsOptional()
  followUpDate?: string;

  @IsString()
  @IsOptional()
  followUpStatus?: string;

  @IsString()
  @IsOptional()
  lostReasonCategory?: string;

  @IsString()
  @IsOptional()
  lostReason?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
