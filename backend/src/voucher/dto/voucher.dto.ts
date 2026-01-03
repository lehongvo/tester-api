import { ApiProperty } from '@nestjs/swagger';

export class VoucherDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  code: string;

  @ApiProperty()
  userId: number;

  @ApiProperty({ description: 'Discount percent (10..45)' })
  percent: number;

  @ApiProperty()
  used: boolean;

  @ApiProperty({ required: false, nullable: true })
  usedAt?: Date;

  @ApiProperty({ required: false, nullable: true })
  usedCourseId?: number;

  @ApiProperty()
  createdAt: Date;
}

