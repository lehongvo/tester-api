import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherAdminController } from './voucher-admin.controller';
import { VoucherMeController } from './voucher-me.controller';
import { VoucherService } from './voucher.service';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher])],
  providers: [VoucherService],
  controllers: [VoucherAdminController, VoucherMeController],
  exports: [VoucherService],
})
export class VoucherModule {}

