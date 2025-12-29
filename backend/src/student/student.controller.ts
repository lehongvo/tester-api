import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('students')
@ApiBearerAuth('JWT-auth')
@Controller('students')
@UseGuards(JwtAuthGuard)
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
  @ApiOperation({
    summary: '➕ Create New Student',
    description: `
**Create a new student record**

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
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({
    summary: '📋 Get All Students',
    description: `
**Retrieve a list of all students**

**Required:** JWT Access Token (click 🔒 Authorize button above)

Returns an array of all student records in the system.
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
  findAll() {
    return this.studentService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: '🔍 Get Student by ID',
    description: `
**Retrieve detailed information about a specific student**

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID (number)

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
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '✏️ Update Student',
    description: `
**Update student information**

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID to update

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
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: '🗑️ Delete Student',
    description: `
**Permanently delete a student record**

**Required:** JWT Access Token (click 🔒 Authorize button above)

**Parameters:**
- \`id\` (path parameter): Student ID to delete

**⚠️ Warning:** This action cannot be undone. The student record will be permanently deleted.

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
  remove(@Param('id') id: string) {
    return this.studentService.remove(+id);
  }
}

