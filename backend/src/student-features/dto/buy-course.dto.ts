import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BuyCourseDto {
  @ApiPropertyOptional({ description: 'Voucher code to apply', example: 'VCH-1A2B3C4D' })
  @IsOptional()
  @IsString()
  voucherCode?: string;
}

