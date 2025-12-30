import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { FixAdminRoleService } from './fix-admin-role.service';
import { User } from '../auth/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { Course } from '../course/entities/course.entity';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student, Course]),
    AccountModule,
    TransactionModule,
  ],
  providers: [SeedService, FixAdminRoleService],
})
export class SeedModule {}

