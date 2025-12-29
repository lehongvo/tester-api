import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'admin',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: 'Password for login',
    example: 'admin123',
    type: String,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

