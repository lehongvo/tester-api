import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminFixController } from './admin-fix.controller';
import { AdminService } from './admin.service';
import { User } from '../auth/entities/user.entity';
import { Student } from '../student/entities/student.entity';
import { AccountModule } from '../account/account.module';
import { TransactionModule } from '../transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Student]),
    AccountModule,
    TransactionModule,
  ],
  controllers: [AdminController, AdminFixController],
  providers: [AdminService],
})
export class AdminModule {}

