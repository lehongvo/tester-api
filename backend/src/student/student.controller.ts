import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/entities/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateStudentDto } from './dto/create-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentService } from './student.service';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentController {
  /**
   * ⚠️ All endpoints in this controller require JWT authentication.
   * 
   * To use these endpoints:
   * 1. First, login using POST /auth/login to get access_token
   * 2. Copy the access_token from response
   * 3. Click "Authorize" button in Swagger UI (🔒 icon at top)
   * 4. Paste token: Bearer {your_access_token}
   * 5. Click "Authorize" then "Close"
   * 6. Now you can test all protected endpoints
   */
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: '➕ Create New Student (Admin only)',
    description: `
**Create a new student record**

**Access Rules:**
- **Admin**: ✅ Allowed
- **Student**: ❌ Forbidden (403)

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Required Fields:**
- \`name\` (string): Full name of the student
- \`email\` (string): Valid email address

**Optional Fields:**
- \`age\` (number): Age of the student
- \`address\` (string): Address of the student

**Example Request:**
\`\`\`json
{
  "name": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "age": 20,
  "address": "123 Main Street, Ho Chi Minh City"
}
\`\`\`
    `,
  })
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({
    status: 201,
    description: 'Student created successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({
    summary: '📋 Get Students (Admin: all | Student: self)',
    description: `
**Retrieve students**

**Access Rules:**
- **Admin**: returns **all** students
- **Student**: returns **only your own** student record

**Required:** JWT Access Token (click 🔒 Authorize button above)

- **Admin**: Returns an array of **all** student records in the system.
- **Student**: Returns an array containing **only your own** student record.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'List of students retrieved successfully',
    type: [StudentResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own account (or admin required)',
  })
  findAll(@Req() req: any) {
    return this.studentService.findAllByRequester({
      userId: req.user.userId,
      role: req.user.role,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: '🔍 Get Student by ID (Admin:any | Student:self)',
    description: `
**Retrieve a student by ID**

**Access Rules:**
- **Admin**: ✅ can fetch any student by ID
- **Student**: ✅ can only fetch **your own** student record (otherwise 403)

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID (number)

**Access Rules:**
- **Admin**: Can fetch any student by ID
- **Student**: Can only fetch **your own** student record

**Example:** \`GET /students/1\`
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Student ID',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Student found and returned',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only view your own account (or admin required)',
  })
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.studentService.findOneByRequester(+id, {
      userId: req.user.userId,
      role: req.user.role,
    });
  }

  @Patch(':id')
  @ApiOperation({
    summary: '✏️ Update Student (Admin:any | Student:self)',
    description: `
**Update student information**

**Access Rules:**
- **Admin**: ✅ can update any student
- **Student**: ✅ can only update **your own** student record (otherwise 403)

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID to update

**Access Rules:**
- **Admin**: Can update any student
- **Student**: Can only update **your own** student record

**Note:** Only provided fields will be updated. Fields not included in request will remain unchanged.

**Example Request:**
\`\`\`json
{
  "name": "Nguyen Van B",
  "age": 21
}
\`\`\`
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Student ID to update',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
    type: StudentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only modify your own account (or admin required)',
  })
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req: any,
  ) {
    return this.studentService.updateByRequester(+id, updateStudentDto, {
      userId: req.user.userId,
      role: req.user.role,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete Student (Admin:any | Student:self)',
    description: `
**Delete a student record / account**

**Access Rules:**
- **Admin**: ✅ can delete any student record
- **Student**: ✅ can only delete **your own** account (otherwise 403)

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID to delete

**Access Rules:**
- **Admin**: Can delete any student record
- **Student**: Can only delete **your own** account

**⚠️ Warning:** This action cannot be undone.
- If **Admin** deletes: only the students record is removed.
- If **Student** deletes self: the corresponding users account is deleted (and students will be removed by cascade).

**Example:** \`DELETE /students/1\`
    `,
  })
  @ApiParam({
    name: 'id',
    description: 'Student ID to delete',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Student deleted successfully',
    schema: {
      example: {
        message: 'Student deleted successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only modify your own account (or admin required)',
  })
  remove(@Param('id') id: string, @Req() req: any) {
    return this.studentService.removeByRequester(+id, {
      userId: req.user.userId,
      role: req.user.role,
    });
  }
}

