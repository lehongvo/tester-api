import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from './account/account.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { StudentModule } from './student/student.module';
import { TransactionModule } from './transaction/transaction.module';

import { Account } from './account/entities/account.entity';
import { User } from './auth/entities/user.entity';
import { Course } from './course/entities/course.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { SeedModule } from './seed/seed.module';
import { StudentFeaturesModule } from './student-features/student-features.module';
import { Student } from './student/entities/student.entity';
import { Transaction } from './transaction/entities/transaction.entity';
import { Voucher } from './voucher/entities/voucher.entity';
import { VoucherModule } from './voucher/voucher.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'tester_db',
      entities: [User, Student, Account, Transaction, Course, Enrollment, Voucher],
      synchronize: true,
    }),
    AuthModule,
    StudentModule,
    AdminModule,
    AccountModule,
    TransactionModule,
    CourseModule,
    EnrollmentModule,
    VoucherModule,
    StudentFeaturesModule,
    SeedModule,
  ],
})
export class AppModule {}
