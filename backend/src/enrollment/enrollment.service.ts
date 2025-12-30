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
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getEnrollmentsByUserId - Invalid userId:', userId, typeof userId);
      throw new Error(`Invalid user ID: ${userId}`);
    }
    console.log('getEnrollmentsByUserId - userId:', validUserId);
    return this.enrollmentRepository.find({
      where: { userId: validUserId },
      order: { enrolledAt: 'DESC' },
    });
  }

  async checkEnrollment(userId: number, courseId: number): Promise<boolean> {
    // Validate userId and courseId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    const validCourseId = typeof courseId === 'number' ? courseId : parseInt(String(courseId), 10);
    if (isNaN(validUserId) || validUserId <= 0 || isNaN(validCourseId) || validCourseId <= 0) {
      console.error('checkEnrollment - Invalid userId or courseId:', userId, courseId);
      throw new Error(`Invalid user ID or course ID: ${userId}, ${courseId}`);
    }
    const enrollment = await this.enrollmentRepository.findOne({
      where: { userId: validUserId, courseId: validCourseId },
    });
    return !!enrollment;
  }
}

