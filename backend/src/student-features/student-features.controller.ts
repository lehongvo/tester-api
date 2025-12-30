import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';
import { StudentFeaturesService } from './student-features.service';
import { TransferDto } from './dto/transfer.dto';

@ApiTags('student-features')
@ApiBearerAuth('JWT-auth')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Student)
export class StudentFeaturesController {
  constructor(private readonly studentFeaturesService: StudentFeaturesService) {}

  @Get('me/account')
  @ApiOperation({
    summary: '💰 Get My Account Balance (Student Only)',
    description: 'Get current account balance for the authenticated student. Only students can access this endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Account balance retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async getMyAccount(@Request() req) {
    return this.studentFeaturesService.getMyAccount(req.user.userId);
  }

  @Post('transactions/transfer')
  @ApiOperation({
    summary: '💸 Transfer Money to Another Student (Student Only)',
    description: 'Transfer money from your account to another student account. Only students can access this endpoint.',
  })
  @ApiResponse({ status: 201, description: 'Transfer successful' })
  @ApiResponse({ status: 400, description: 'Bad request - Insufficient balance or invalid recipient' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async transfer(@Request() req, @Body() transferDto: TransferDto) {
    return this.studentFeaturesService.transfer(req.user.userId, transferDto);
  }

  @Post('courses/:id/buy')
  @ApiOperation({
    summary: '🛒 Buy Course (Student Only)',
    description: 'Purchase a course using account balance. Only students can access this endpoint.',
  })
  @ApiParam({ name: 'id', description: 'Course ID', type: Number })
  @ApiResponse({ status: 201, description: 'Course purchased successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Insufficient balance or already enrolled' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async buyCourse(@Request() req, @Param('id') id: string) {
    return this.studentFeaturesService.buyCourse(req.user.userId, +id);
  }

  @Get('transactions/history')
  @ApiOperation({
    summary: '📜 Get My Transaction History (Student Only)',
    description: 'Get transaction history for the authenticated student. Only students can access this endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Transaction history retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async getMyTransactions(@Request() req) {
    return this.studentFeaturesService.getMyTransactions(req.user.userId);
  }

  @Get('me/enrollments')
  @ApiOperation({
    summary: '📚 Get My Enrollments (Student Only)',
    description: 'Get list of courses enrolled by the authenticated student. Only students can access this endpoint.',
  })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async getMyEnrollments(@Request() req) {
    return this.studentFeaturesService.getMyEnrollments(req.user.userId);
  }

  @Get('students/list')
  @ApiOperation({
    summary: '👥 Get Students List for Transfer (Student Only)',
    description: 'Get list of all students (excluding self) for transfer selection. Only students can access this endpoint.',
  })
  @ApiResponse({ status: 200, description: 'List of students retrieved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Student role required' })
  async getStudentsList(@Request() req) {
    console.log('getStudentsList - req.user:', req.user);
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    const parsedUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(parsedUserId)) {
      console.error('Invalid userId:', userId, typeof userId);
      throw new Error(`Invalid user ID: ${userId}`);
    }
    return this.studentFeaturesService.getStudentsList(parsedUserId);
  }
}

