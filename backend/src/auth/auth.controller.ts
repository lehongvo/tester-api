import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ 
    summary: '🔐 User Login - Get Access Token',
    description: `
**Authenticate user and get JWT access token**

This endpoint authenticates a user with username and password, and returns a JWT access token that must be used for all subsequent API calls to protected endpoints.

**Steps to use:**
1. Call this endpoint with valid credentials
2. Copy the \`access_token\` from the response
3. Use this token in the Authorization header for protected endpoints:
   \`Authorization: Bearer {access_token}\`
4. Token is valid for 24 hours

**Default Credentials:**
- Username: \`admin\`
- Password: \`admin123\`
    `
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Login credentials',
    examples: {
      default: {
        summary: 'Default admin account',
        value: {
          username: 'admin',
          password: 'admin123'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: '✅ Login successful - Access token returned. Copy the access_token and use it in Authorization header for protected endpoints.',
    type: LoginResponseDto,
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwic3ViIjoxLCJpYXQiOjE3NjcwMjU0ODcsImV4cCI6MTc2NzExMTg4N30.Y7-HnXpqHdZ4ek0B90q4Lab4SOxJCTigem0FJa7lPKY',
        user: {
          id: 1,
          username: 'admin'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: '❌ Bad Request - Missing or invalid input',
    schema: {
      example: {
        statusCode: 400,
        message: ['username should not be empty', 'password should not be empty'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: '❌ Unauthorized - Invalid username or password',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
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
    summary: '🚪 User Logout',
    description: `
**Logout the authenticated user**

This endpoint logs out the current user. Requires a valid JWT access token in the Authorization header.

**Note:** This is a stateless logout. The token will remain valid until it expires (24 hours). For security, you should discard the token on the client side after logout.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: '✅ Logout successful',
    schema: {
      example: {
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: '❌ Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized'
      }
    }
  })
  async logout(@Request() req) {
    return this.authService.logout();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: '👤 Get Current User Info',
    description: `
**Get current authenticated user information**

This endpoint returns the current user's information based on the JWT token. Useful for refreshing user data.
    `
  })
  @ApiResponse({ 
    status: 200, 
    description: '✅ User information retrieved',
    schema: {
      example: {
        id: 1,
        username: 'admin',
        role: 'admin'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: '❌ Unauthorized - Invalid or missing JWT token',
  })
  async getMe(@Request() req) {
    return this.authService.getMe(req.user.userId);
  }
}

