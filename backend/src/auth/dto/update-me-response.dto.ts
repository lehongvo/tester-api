import { ApiProperty } from '@nestjs/swagger';

export class UpdateMeResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'vo1' })
  username: string;

  @ApiProperty({ example: 'student' })
  role: string;

  @ApiProperty({ example: 'vo@gmail.com', nullable: true })
  email?: string;

  @ApiProperty({ example: 'voleh... ', nullable: true })
  fullName?: string;
}

