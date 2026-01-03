import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Role } from '../auth/entities/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnrollmentService } from './enrollment.service';

@ApiTags('enrollments')
@ApiBearerAuth('JWT-auth')
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({
    summary: '📚 Get Enrollments (Admin: all | Student: self)',
    description: `
**Get enrollments**

**Access Rules:**
- **Admin**: returns **all** enrollments
- **Student**: returns **only your own** enrollments

**Required:** JWT Access Token
    `,
  })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getEnrollments(@Req() req: any) {
    const requester = req.user;
    if (requester?.role === Role.Admin) {
      return this.enrollmentService.getAllEnrollments();
    }
    return this.enrollmentService.getEnrollmentsByUserId(requester.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: '🔍 Get Enrollment by ID (Admin:any | Student:self)',
    description: `
**Get enrollment by ID**

**Access Rules:**
- **Admin**: can fetch any enrollment
- **Student**: can only fetch your own enrollment (otherwise 403)

**Required:** JWT Access Token
    `,
  })
  @ApiParam({ name: 'id', description: 'Enrollment ID', type: Number })
  @ApiResponse({ status: 200, description: 'Enrollment retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: 'Forbidden - You can only view your own enrollments (or admin required)' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  async getEnrollmentById(@Param('id') id: string, @Req() req: any) {
    const requester = req.user;
    return this.enrollmentService.getEnrollmentByIdForRequester(+id, {
      userId: requester.userId,
      role: requester.role,
    });
  }
}



