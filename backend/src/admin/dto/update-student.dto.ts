import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateStudentDto {
    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the student',
        required: false,
    })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiProperty({
        example: 'john@example.com',
        description: 'Email address of the student',
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: 20,
        description: 'Age of the student',
        required: false,
    })
    @IsNumber()
    @IsOptional()
    age?: number;

    @ApiProperty({
        example: '123 Main St, City, Country',
        description: 'Address of the student',
        required: false,
    })
    @IsString()
    @IsOptional()
    address?: string;
}
