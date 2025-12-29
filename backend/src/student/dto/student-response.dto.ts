import { ApiProperty } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the student',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Full name of the student',
    example: 'Nguyen Van A',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Email address of the student',
    example: 'nguyenvana@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Age of the student',
    example: 20,
    type: Number,
    required: false,
    nullable: true,
  })
  age?: number;

  @ApiProperty({
    description: 'Address of the student',
    example: '123 Main Street, Ho Chi Minh City',
    type: String,
    required: false,
    nullable: true,
  })
  address?: string;
}

