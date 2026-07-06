import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUUID,
  Min,
  IsJSON,
} from 'class-validator';

export class CreateProposalDto {
  @IsUUID()
  @IsOptional()
  opportunityId?: string;

  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  technicalContent?: string;

  @IsString()
  @IsOptional()
  financialContent?: string;

  @IsOptional()
  scopeOfWork?: any;

  @IsNumber()
  @IsNotEmpty()
  totalValue: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  validityDays?: number;
}
