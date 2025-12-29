import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async findOne(id: number): Promise<Student> {
    return this.studentRepository.findOne({ where: { id } });
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    await this.studentRepository.update(id, updateStudentDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.studentRepository.delete(id);
  }
}

