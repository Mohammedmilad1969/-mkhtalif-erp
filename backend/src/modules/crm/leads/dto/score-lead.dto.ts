import { IsInt, Min, Max, IsNotEmpty } from 'class-validator';

export class ScoreLeadDto {
  @IsInt()
  @Min(0)
  @Max(3)
  @IsNotEmpty()
  serviceTypeScore: number;

  @IsInt()
  @Min(0)
  @Max(3)
  @IsNotEmpty()
  clarityScore: number;

  @IsInt()
  @Min(0)
  @Max(2)
  @IsNotEmpty()
  budgetScore: number;

  @IsInt()
  @Min(0)
  @Max(2)
  @IsNotEmpty()
  opportunityScore: number;
}
