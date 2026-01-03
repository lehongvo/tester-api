import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ minLength: 6, example: 'oldPassword' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ minLength: 6, example: 'newPassword123' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

