import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Role } from '../auth/entities/role.enum';
import { AccountService } from '../account/account.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { CourseService } from '../course/course.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { PaymentStatus } from '../enrollment/entities/enrollment.entity';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class StudentFeaturesService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private courseService: CourseService,
    private enrollmentService: EnrollmentService,
  ) {}

  async getMyAccount(userId: number) {
    const account = await this.accountService.getAccountByUserId(userId);
    return {
      balance: parseFloat(account.balance.toString()),
      currency: account.currency,
    };
  }

  async transfer(userId: number, transferDto: TransferDto) {
    // Check if recipient exists
    const recipient = await this.userRepository.findOne({
      where: { id: transferDto.toUserId },
    });
    if (!recipient) {
      throw new NotFoundException(`Recipient user with ID ${transferDto.toUserId} not found`);
    }

    // Check if recipient is a student
    if (recipient.role !== Role.Student) {
      throw new BadRequestException('Can only transfer to students');
    }

    // Check if sender has enough balance
    const senderAccount = await this.accountService.getAccountByUserId(userId);
    const senderBalance = parseFloat(senderAccount.balance.toString());
    if (senderBalance < transferDto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Check if transferring to self
    if (userId === transferDto.toUserId) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // Deduct from sender
    await this.accountService.adjustBalance(userId, -transferDto.amount);

    // Add to recipient
    await this.accountService.adjustBalance(transferDto.toUserId, transferDto.amount);

    // Log transaction
    await this.transactionService.createTransaction(
      userId,
      transferDto.toUserId,
      transferDto.amount,
      TransactionType.Transfer,
      transferDto.description || `Transfer from user ${userId} to user ${transferDto.toUserId}`,
    );

    return {
      message: 'Transfer successful',
      fromUserId: userId,
      toUserId: transferDto.toUserId,
      amount: transferDto.amount,
      newBalance: await this.accountService.getBalance(userId),
    };
  }

  async buyCourse(userId: number, courseId: number) {
    // Check if course exists
    const course = await this.courseService.findOne(courseId);

    // Check if already enrolled
    const isEnrolled = await this.enrollmentService.checkEnrollment(userId, courseId);
    if (isEnrolled) {
      throw new BadRequestException('Already enrolled in this course');
    }

    // Check balance
    const account = await this.accountService.getAccountByUserId(userId);
    const balance = parseFloat(account.balance.toString());
    const price = parseFloat(course.price.toString());

    if (balance < price) {
      throw new BadRequestException('Insufficient balance to purchase this course');
    }

    // Deduct balance
    await this.accountService.adjustBalance(userId, -price);

    // Create enrollment
    const enrollment = await this.enrollmentService.createEnrollment(
      userId,
      courseId,
      PaymentStatus.Paid,
    );

    // Log transaction
    await this.transactionService.createTransaction(
      userId,
      null,
      price,
      TransactionType.Payment,
      `Course purchase: ${course.name}`,
    );

    return {
      message: 'Course purchased successfully',
      enrollment,
      course,
      remainingBalance: await this.accountService.getBalance(userId),
    };
  }

  async getMyTransactions(userId: number) {
    return this.transactionService.getTransactionsByUserId(userId);
  }

  async getMyEnrollments(userId: number) {
    return this.enrollmentService.getEnrollmentsByUserId(userId);
  }

  async getStudentsList(currentUserId: number) {
    try {
      // Ensure currentUserId is a valid number
      const userId = typeof currentUserId === 'number' ? currentUserId : parseInt(String(currentUserId), 10);
      if (isNaN(userId) || userId <= 0) {
        console.error('Invalid currentUserId:', currentUserId, typeof currentUserId);
        throw new BadRequestException(`Invalid user ID: ${currentUserId}`);
      }

      console.log('getStudentsList - userId:', userId);
      const students = await this.userRepository.find({
        where: { role: Role.Student },
      });
      console.log('getStudentsList - found students:', students.length);

      // Filter out current user and return formatted list
      return students
        .filter(user => user.id !== userId)
        .map(user => ({
          id: user.id,
          username: user.username,
          email: user.email || null,
          fullName: user.fullName || null,
          studentId: user.studentId || null,
          displayName: `${user.fullName || user.username} (${user.studentId || user.email || 'N/A'})`,
        }));
    } catch (error) {
      console.error('Error getting students list:', error);
      throw error;
    }
  }
}

