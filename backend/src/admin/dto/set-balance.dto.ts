import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class SetBalanceDto {
  @ApiProperty({
    description: 'New balance amount',
    example: 15000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  balance: number;

  @ApiProperty({
    description: 'Reason for balance adjustment',
    example: 'Admin adjustment',
    required: false,
  })
  @IsOptional()
  description?: string;
}

