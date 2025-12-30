import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentFeaturesController } from './student-features.controller';
import { StudentFeaturesService } from './student-features.service';
import { User } from '../auth/entities/user.entity';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AccountModule,
    TransactionModule,
    CourseModule,
    EnrollmentModule,
  ],
  controllers: [StudentFeaturesController],
  providers: [StudentFeaturesService],
})
export class StudentFeaturesModule {}

