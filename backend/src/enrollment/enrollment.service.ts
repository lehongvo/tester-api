import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';
import { PaymentStatus } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
  ) {}

  async createEnrollment(
    userId: number,
    courseId: number,
    paymentStatus: PaymentStatus = PaymentStatus.Paid,
  ): Promise<Enrollment> {
    const enrollment = this.enrollmentRepository.create({
      userId,
      courseId,
      paymentStatus,
    });
    return this.enrollmentRepository.save(enrollment);
  }

  async getEnrollmentsByUserId(userId: number): Promise<Enrollment[]> {
    return this.enrollmentRepository.find({
      where: { userId },
      order: { enrolledAt: 'DESC' },
    });
  }

  async checkEnrollment(userId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId, courseId },
    });
    return !!enrollment;
  }
}

