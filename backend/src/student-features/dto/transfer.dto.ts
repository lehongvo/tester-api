import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    description: 'User ID of the recipient',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  toUserId: number;

  @ApiProperty({
    description: 'Amount to transfer',
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0.01)
  amount: number;

  @ApiProperty({
    description: 'Transfer description',
    example: 'Payment for lunch',
    required: false,
  })
  description?: string;
}

