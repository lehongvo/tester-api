import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course name',
    example: 'Introduction to Programming',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Course price in USD',
    example: 500,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: 'Course description',
    example: 'Learn the fundamentals of programming',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Instructor name',
    example: 'Dr. John Smith',
  })
  @IsString()
  @IsOptional()
  instructor?: string;

  @ApiPropertyOptional({
    description: 'Course duration',
    example: '12 weeks',
  })
  @IsString()
  @IsOptional()
  duration?: string;
}

