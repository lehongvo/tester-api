import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/entities/role.enum';
import { User } from '../auth/entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentRepository.create(createStudentDto);
    return this.studentRepository.save(student);
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find();
  }

  async findAllByRequester(requester: { userId: number; role: Role }): Promise<Student[]> {
    if (requester.role === Role.Admin) {
      return this.studentRepository.find();
    }

    return this.studentRepository.find({ where: { userId: requester.userId } });
  }

  async findOne(id: number): Promise<Student> {
    return this.studentRepository.findOne({ where: { id } });
  }

  async findOneByRequester(
    id: number,
    requester: { userId: number; role: Role },
  ): Promise<Student> {
    const student = await this.studentRepository.findOne({ where: { id } });
    if (!student) throw new NotFoundException('Student not found');

    if (requester.role === Role.Admin) {
      return student;
    }

    if (student.userId !== requester.userId) {
      throw new ForbiddenException('You can only view your own account');
    }

    return student;
  }

  private async assertCanMutateStudent(params: {
    targetStudentId: number;
    requesterUserId: number;
    requesterRole: Role;
  }): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: params.targetStudentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (params.requesterRole === Role.Admin) {
      return student;
    }

    // Student can only modify their own student record
    if (student.userId !== params.requesterUserId) {
      throw new ForbiddenException('You can only modify your own account');
    }

    return student;
  }

  async updateByRequester(
    id: number,
    updateStudentDto: UpdateStudentDto,
    requester: { userId: number; role: Role },
  ): Promise<Student> {
    await this.assertCanMutateStudent({
      targetStudentId: id,
      requesterUserId: requester.userId,
      requesterRole: requester.role,
    });

    await this.studentRepository.update(id, updateStudentDto);
    return this.findOne(id);
  }

  async removeByRequester(
    id: number,
    requester: { userId: number; role: Role },
  ): Promise<void> {
    const student = await this.assertCanMutateStudent({
      targetStudentId: id,
      requesterUserId: requester.userId,
      requesterRole: requester.role,
    });

    // If requester is admin: only remove student record
    // If requester is student: remove both Student record and corresponding User account (cascade will remove Student if we delete User)
    if (requester.role === Role.Admin) {
      await this.studentRepository.delete(id);
      return;
    }

    await this.userRepository.delete(student.userId);
  }
}

