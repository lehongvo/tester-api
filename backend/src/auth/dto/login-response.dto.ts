import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Username',
    example: 'admin',
    type: String,
  })
  username: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token. Use this token in Authorization header for protected endpoints.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3NjcwMjU0ODcsImV4cCI6MTc2NzExMTg4N30.Y7-HnXpqHdZ4ek0B90q4Lab4SOxJCTigem0FJa7lPKY',
    type: String,
  })
  access_token: string;

  @ApiProperty({
    description: 'User information',
    type: UserResponseDto,
  })
  user: UserResponseDto;
}



