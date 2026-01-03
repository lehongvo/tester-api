import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { Role } from '../auth/entities/role.enum';
import { User } from '../auth/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { TransactionType } from '../transaction/entities/transaction.entity';
import { TransactionService } from '../transaction/transaction.service';
import { VoucherService } from '../voucher/voucher.service';
import { CreateStudentUserDto } from './dto/create-student-user.dto';
import { SetBalanceDto } from './dto/set-balance.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private voucherService: VoucherService,
  ) { }

  async createStudentUser(createDto: CreateStudentUserDto) {
    // Check if username or email already exists
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createDto.username },
        { email: createDto.email },
      ],
    });
    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    // Auto-generate Student ID if not provided
    let studentId = createDto.studentId;
    if (!studentId) {
      // Get the highest student ID number
      const allStudents = await this.userRepository.find({
        where: { role: Role.Student },
        order: { studentId: 'DESC' },
      });

      let nextNumber = 1;
      if (allStudents.length > 0) {
        // Extract number from existing student IDs (format: SV001, SV002, etc.)
        const numbers = allStudents
          .map(s => s.studentId)
          .filter(id => id && id.match(/^SV\d+$/))
          .map(id => parseInt(id.replace('SV', '')))
          .filter(n => !isNaN(n));

        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        } else {
          nextNumber = allStudents.length + 1;
        }
      }

      studentId = `SV${String(nextNumber).padStart(3, '0')}`;
    } else {
      // Check if provided studentId already exists
      const existingStudentId = await this.userRepository.findOne({
        where: { studentId: createDto.studentId },
      });
      if (existingStudentId) {
        throw new ConflictException('Student ID already exists');
      }
    }

    // Generate password if not provided
    const password = createDto.password || this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = this.userRepository.create({
      username: createDto.username,
      email: createDto.email,
      fullName: createDto.fullName,
      studentId: studentId,
      password: hashedPassword,
      role: Role.Student,
    });
    const savedUser = await this.userRepository.save(user);

    // Create student entity
    const student = this.studentRepository.create({
      userId: savedUser.id,
      name: createDto.fullName, // Use fullName for student entity name
      email: createDto.email,
      age: createDto.age,
      address: createDto.address,
    });
    const savedStudent = await this.studentRepository.save(student);

    // Create account with 10,000 USD initial balance
    const account = await this.accountService.createAccount(savedUser.id, 10000);

    // Log initial balance transaction
    await this.transactionService.createTransaction(
      null,
      savedUser.id,
      10000,
      TransactionType.Adjustment,
      'Initial account balance',
    );

    // Auto-generate 10 vouchers for the new student
    await this.voucherService.generateVouchersForUser(savedUser.id, 10);

    return {
      user: {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        fullName: savedUser.fullName,
        studentId: savedUser.studentId,
        role: savedUser.role,
      },
      student: savedStudent,
      account: {
        id: account.id,
        balance: account.balance,
        currency: account.currency,
      },
      tempPassword: password,
    };
  }

  async setStudentBalance(userId: number, setBalanceDto: SetBalanceDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role !== Role.Student) {
      throw new Error('Can only set balance for students');
    }

    const account = await this.accountService.getAccountByUserId(userId);
    const oldBalance = parseFloat(account.balance.toString());
    const newBalance = setBalanceDto.balance;
    const difference = newBalance - oldBalance;

    // Update balance
    await this.accountService.updateBalance(userId, newBalance);

    // Log transaction
    await this.transactionService.createTransaction(
      null,
      userId,
      difference,
      TransactionType.Adjustment,
      setBalanceDto.description || `Admin balance adjustment: ${oldBalance} -> ${newBalance}`,
    );

    return {
      userId,
      oldBalance,
      newBalance,
      difference,
      account: await this.accountService.getAccountByUserId(userId),
    };
  }

  async getAllTransactions() {
    return this.transactionService.getAllTransactions();
  }

  async getStudentsWithBalances() {
    const students = await this.userRepository.find({
      where: { role: Role.Student },
      order: { createdAt: 'DESC' },
    });

    const studentsWithBalances = await Promise.all(
      students.map(async (user) => {
        try {
          const account = await this.accountService.getAccountByUserId(user.id);
          const studentEntity = await this.studentRepository.findOne({
            where: { userId: user.id },
          });
          return {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              studentId: user.studentId,
            },
            student: studentEntity,
            account: {
              balance: parseFloat(account.balance.toString()),
              currency: account.currency,
            },
          };
        } catch (error) {
          return {
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              fullName: user.fullName,
              studentId: user.studentId,
            },
            student: null,
            account: {
              balance: 0,
              currency: 'USD',
            },
          };
        }
      }),
    );

    return studentsWithBalances;
  }

  async fixAdminRole() {
    const admin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (!admin) {
      throw new NotFoundException('Admin user not found');
    }

    if (admin.role !== Role.Admin) {
      admin.role = Role.Admin;
      await this.userRepository.save(admin);
      return {
        message: 'Admin role fixed successfully',
        user: {
          id: admin.id,
          username: admin.username,
          role: admin.role,
        },
      };
    }

    return {
      message: 'Admin role is already correct',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    };
  }

  async updateStudent(userId: number, updateDto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    if (user.role !== Role.Student) {
      throw new Error('Can only update student users');
    }

    // Update User entity
    if (updateDto.fullName) user.fullName = updateDto.fullName;
    if (updateDto.email) user.email = updateDto.email;
    await this.userRepository.save(user);

    // Update Student entity
    let student = await this.studentRepository.findOne({ where: { userId: user.id } });
    if (!student) {
      // Create if missing (shouldn't happen for valid students)
      student = this.studentRepository.create({ userId: user.id });
    }

    if (updateDto.fullName) student.name = updateDto.fullName;
    if (updateDto.email) student.email = updateDto.email;
    if (updateDto.age !== undefined) student.age = updateDto.age;
    if (updateDto.address !== undefined) student.address = updateDto.address;

    const savedStudent = await this.studentRepository.save(student);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
      },
      student: savedStudent,
    };
  }

  private generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

