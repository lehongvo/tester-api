import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with username and password. Returns JWT access token for subsequent API calls.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 1,
          username: 'admin'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials'
      }
    }
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'User logout',
    description: 'Logout the authenticated user. Requires valid JWT token.'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  async logout(@Request() req) {
    return this.authService.logout();
  }
}

