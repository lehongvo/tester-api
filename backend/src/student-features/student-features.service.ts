import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { Role } from '../auth/entities/role.enum';
import { User } from '../auth/entities/user.entity';
import { CourseService } from '../course/course.service';
import { EnrollmentService } from '../enrollment/enrollment.service';
import { PaymentStatus } from '../enrollment/entities/enrollment.entity';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { VoucherService } from '../voucher/voucher.service';
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
    private voucherService: VoucherService,
  ) {}

  async getMyAccount(userId: number) {
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getMyAccount - Invalid userId:', userId, typeof userId);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    console.log('getMyAccount - userId:', validUserId);
    const account = await this.accountService.getAccountByUserId(validUserId);
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

  async buyCourse(userId: number, courseId: number, voucherCode?: string) {
    // Check if course exists
    const course = await this.courseService.findOne(courseId);

    // Check if already enrolled
    const isEnrolled = await this.enrollmentService.checkEnrollment(userId, courseId);
    if (isEnrolled) {
      throw new BadRequestException('Already enrolled in this course');
    }

    // Check balance (+ optional voucher)
    const account = await this.accountService.getAccountByUserId(userId);
    const balance = parseFloat(account.balance.toString());
    const originalPrice = parseFloat(course.price.toString());

    let finalPrice = originalPrice;
    let appliedVoucherPercent: number | null = null;

    if (voucherCode) {
      const voucher = await this.voucherService.validateForPurchase({ userId, courseId, voucherCode });
      if (voucher) {
        appliedVoucherPercent = voucher.percent;
        finalPrice = Math.round(originalPrice * (1 - voucher.percent / 100) * 100) / 100;
      }
    }

    if (balance < finalPrice) {
      throw new BadRequestException('Insufficient balance to purchase this course');
    }

    // Deduct balance
    await this.accountService.adjustBalance(userId, -finalPrice);

    // Create enrollment
    const enrollment = await this.enrollmentService.createEnrollment(
      userId,
      courseId,
      PaymentStatus.Paid,
    );

    // Mark voucher used (if applied)
    if (voucherCode && appliedVoucherPercent !== null) {
      await this.voucherService.markUsedByCode({ userId, voucherCode, courseId });
    }

    // Log transaction
    const paymentDescription = appliedVoucherPercent
      ? `Course purchase: ${course.name} (voucher ${voucherCode} -${appliedVoucherPercent}%)`
      : `Course purchase: ${course.name}`;

    await this.transactionService.createTransaction(
      userId,
      null,
      finalPrice,
      TransactionType.Payment,
      paymentDescription,
    );

    return {
      message: 'Course purchased successfully',
      enrollment,
      course,
      originalPrice,
      finalPrice,
      appliedVoucher: appliedVoucherPercent
        ? {
            code: voucherCode,
            percent: appliedVoucherPercent,
          }
        : null,
      remainingBalance: await this.accountService.getBalance(userId),
    };
  }

  async getMyTransactions(userId: number) {
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getMyTransactions - Invalid userId:', userId, typeof userId);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    console.log('getMyTransactions - userId:', validUserId);
    return this.transactionService.getTransactionsByUserId(validUserId);
  }

  async getMyEnrollments(userId: number) {
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getMyEnrollments - Invalid userId:', userId, typeof userId);
      throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    console.log('getMyEnrollments - userId:', validUserId);
    return this.enrollmentService.getEnrollmentsByUserId(validUserId);
  }

  async getStudentsList(currentUserId: number) {
    try {
      console.log('getStudentsList SERVICE - currentUserId:', currentUserId, typeof currentUserId);
      // Ensure currentUserId is a valid number
      const userId = typeof currentUserId === 'number' ? currentUserId : parseInt(String(currentUserId), 10);
      if (isNaN(userId) || userId <= 0) {
        console.error('Invalid currentUserId:', currentUserId, typeof currentUserId);
        throw new BadRequestException(`Invalid user ID: ${currentUserId}`);
      }

      console.log('getStudentsList SERVICE - userId:', userId);
      const students = await this.userRepository.find({
        where: { role: Role.Student },
      });
      console.log('getStudentsList SERVICE - found students:', students.length);

      // Filter out current user and return formatted list
      const filtered = students.filter(user => {
        console.log('Filtering - user.id:', user.id, 'userId:', userId, 'match:', user.id !== userId);
        return user.id !== userId;
      });
      console.log('getStudentsList SERVICE - filtered count:', filtered.length);
      
      return filtered.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email || null,
        fullName: user.fullName || null,
        studentId: user.studentId || null,
        displayName: `${user.fullName || user.username} (${user.studentId || user.email || 'N/A'})`,
      }));
    } catch (error) {
      console.error('Error getting students list:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }
}

