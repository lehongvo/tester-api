import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { StudentModule } from './student/student.module';
import { AdminModule } from './admin/admin.module';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { CourseModule } from './course/course.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { StudentFeaturesModule } from './student-features/student-features.module';
import { SeedModule } from './seed/seed.module';
import { User } from './auth/entities/user.entity';
import { Student } from './student/entities/student.entity';
import { Account } from './account/entities/account.entity';
import { Course } from './course/entities/course.entity';
import { Enrollment } from './enrollment/entities/enrollment.entity';
import { Transaction } from './transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'tester_db',
      entities: [User, Student, Account, Transaction, Course, Enrollment],
      synchronize: true,
    }),
    AuthModule,
    StudentModule,
    AdminModule,
    AccountModule,
    TransactionModule,
    CourseModule,
    EnrollmentModule,
    StudentFeaturesModule,
    SeedModule,
  ],
})
export class AppModule {}
