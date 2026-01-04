import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherAdminController } from './voucher-admin.controller';
import { VoucherMeController } from './voucher-me.controller';
import { VoucherService } from './voucher.service';

import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, User])],
  providers: [VoucherService],
  controllers: [VoucherAdminController, VoucherMeController],
  exports: [VoucherService],
})
export class VoucherModule { }

