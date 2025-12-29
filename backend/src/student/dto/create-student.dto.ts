import { IsString, IsEmail, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Full name of the student',
    example: 'Nguyen Van A',
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email address of the student',
    example: 'nguyenvana@example.com',
    type: String,
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Age of the student',
    example: 20,
    type: Number,
    minimum: 1,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  age?: number;

  @ApiPropertyOptional({
    description: 'Address of the student',
    example: '123 Main Street, Ho Chi Minh City',
    type: String,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

