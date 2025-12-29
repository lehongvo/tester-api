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
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new student',
    description: 'Create a new student record. All fields except age and address are required.',
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
    summary: 'Get all students',
    description: 'Retrieve a list of all students in the system.',
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
    summary: 'Get a student by ID',
    description: 'Retrieve detailed information about a specific student by their ID.',
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
    summary: 'Update a student',
    description: 'Update student information. Only provided fields will be updated.',
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
    summary: 'Delete a student',
    description: 'Permanently delete a student record from the system.',
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

