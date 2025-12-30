import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentUserDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'student001',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Email address',
    example: 'student001@school.edu',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Full name',
    example: 'Nguyen Van A',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Student ID (optional, will be auto-generated if not provided)',
    example: 'SV001',
    required: false,
  })
  @IsString()
  @IsOptional()
  studentId?: string;

  @ApiProperty({
    description: 'Password (if not provided, will be auto-generated)',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  password?: string;


  @ApiProperty({
    description: 'Age',
    example: 20,
    required: false,
  })
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'Address',
    example: '123 Main Street',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

