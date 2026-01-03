import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { CreateStudentUserDto } from './dto/create-student-user.dto';
import { SetBalanceDto } from './dto/set-balance.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Post('students')
  @ApiOperation({
    summary: '➕ Create Student User (Admin Only)',
    description: `
**Create a new student user account with login credentials**

**Required:** Admin role + JWT Access Token

**Features:**
- Creates User account with student role
- Creates Student entity record
- Creates Account with initial balance of 10,000 USD
- Logs initial balance transaction
- Returns temporary password if not provided

**Note:** If password is not provided, a random password will be generated and returned in the response.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Student user created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Username, email, or student ID already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async createStudentUser(@Body() createDto: CreateStudentUserDto) {
    return this.adminService.createStudentUser(createDto);
  }

  @Put('students/:id/balance')
  @ApiOperation({
    summary: '💰 Set Student Balance (Admin Only)',
    description: `
    **Set or adjust student account balance**

    **Required:** Admin role + JWT Access Token

    **Parameters:**
    - \`id\` (path parameter): User ID of the student

    **Features:**
    - Sets absolute balance amount
    - Logs adjustment transaction
    - Returns old balance, new balance, and difference
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'User ID of the student',
    type: Number,
    example: 2,
  })
  @ApiResponse({
    status: 200,
    description: 'Balance updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async setStudentBalance(
    @Param('id') id: string,
    @Body() setBalanceDto: SetBalanceDto,
  ) {
    return this.adminService.setStudentBalance(+id, setBalanceDto);
  }

  @Put('students/:id')
  @ApiOperation({
    summary: '✏️ Update Student Information (Admin Only)',
    description: `
    **Update student profile details**

    **Required:** Admin role + JWT Access Token

    **Parameters:**
    - \`id\` (path parameter): User ID of the student

    **Updates:**
    - Full Name
    - Email
    - Age
    - Address
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'User ID of the student',
    type: Number,
    example: 5,
  })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateStudent(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentDto,
  ) {
    return this.adminService.updateStudent(+id, updateDto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: '📊 Get All Transactions (Admin Only)',
    description: `
**Retrieve all transactions in the system**

**Required:** Admin role + JWT Access Token

Returns a list of all transactions (transfers, payments, adjustments) ordered by creation date (newest first).
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllTransactions() {
    return this.adminService.getAllTransactions();
  }

  @Get('students/with-balances')
  @ApiOperation({
    summary: '👥 Get All Students with Balances (Admin Only)',
    description: `
**Retrieve all students with their account balances**

**Required:** Admin role + JWT Access Token

Returns a list of all students (users with student role) along with their account balances and student entity information.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of students with balances',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getStudentsWithBalances() {
    return this.adminService.getStudentsWithBalances();
  }

  @Post('fix-admin-role')
  @ApiOperation({
    summary: '🔧 Fix Admin Role (Admin Only)',
    description: `
**Fix admin user role if it's incorrect**

**Required:** Admin role + JWT Access Token

This endpoint ensures the admin user has the correct role. Useful if admin role was set incorrectly.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Admin role fixed or already correct',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async fixAdminRole() {
    return this.adminService.fixAdminRole();
  }
}

