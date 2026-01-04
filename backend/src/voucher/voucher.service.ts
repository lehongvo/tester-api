import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/entities/role.enum';
import { User } from '../auth/entities/user.entity';
import { Voucher } from './entities/voucher.entity';

@Injectable()
export class VoucherService {
  private readonly logger = new Logger(VoucherService.name);

  constructor(
    @InjectRepository(Voucher)
    private voucherRepository: Repository<Voucher>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  private randomPercent(min = 5, max = 50) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private generateCode() {
    const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
    return `VCH-${rand}`;
  }

  async generateVouchersForUser(userId: number, count = 10) {
    const vouchers: Voucher[] = [];

    for (let i = 0; i < count; i++) {
      let code = this.generateCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await this.voucherRepository.findOne({ where: { code } });
        if (!exists) break;
        code = this.generateCode();
      }

      const v = this.voucherRepository.create({
        userId,
        code,
        percent: this.randomPercent(),
        used: false,
      });
      vouchers.push(v);
    }

    return this.voucherRepository.save(vouchers);
  }

  async listAll(params?: { userId?: number; used?: boolean; q?: string }) {
    const qb = this.voucherRepository.createQueryBuilder('v');

    if (params?.userId) {
      qb.andWhere('v.userId = :userId', { userId: params.userId });
    }
    if (typeof params?.used === 'boolean') {
      qb.andWhere('v.used = :used', { used: params.used });
    }
    if (params?.q) {
      const q = `%${params.q.toLowerCase()}%`;
      qb.andWhere('LOWER(v.code) LIKE :q', { q });
    }

    qb.orderBy('v.createdAt', 'DESC');
    return qb.getMany();
  }

  async listMine(userId: number, includeUsed = true) {
    const where: any = { userId };
    if (!includeUsed) where.used = false;
    return this.voucherRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    return this.voucherRepository.findOne({ where: { id } });
  }

  async getByCodeForUser(code: string, userId: number) {
    return this.voucherRepository.findOne({ where: { code, userId } });
  }

  async markUsed(params: { voucherId: number; courseId: number }) {
    const voucher = await this.getById(params.voucherId);
    if (!voucher) throw new BadRequestException('Voucher not found');
    if (voucher.used) throw new BadRequestException('Voucher already used');

    voucher.used = true;
    voucher.usedAt = new Date();
    voucher.usedCourseId = params.courseId;
    return this.voucherRepository.save(voucher);
  }

  async validateForPurchase(params: { userId: number; courseId: number; voucherCode?: string }) {
    if (!params.voucherCode) return null;
    const voucher = await this.getByCodeForUser(params.voucherCode, params.userId);
    if (!voucher) throw new BadRequestException('Voucher not found');
    if (voucher.used) throw new BadRequestException('Voucher already used');
    return voucher;
  }

  async markUsedByCode(params: { userId: number; voucherCode: string; courseId: number }) {
    const voucher = await this.getByCodeForUser(params.voucherCode, params.userId);
    if (!voucher) throw new BadRequestException('Voucher not found');
    if (voucher.used) throw new BadRequestException('Voucher already used');

    voucher.used = true;
    voucher.usedAt = new Date();
    voucher.usedCourseId = params.courseId;
    return this.voucherRepository.save(voucher);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCheckMissingVouchers() {
    this.logger.log('✨ [Cron] Checking for students with missing vouchers...');

    // Find all students
    const students = await this.userRepository.find({
      where: { role: Role.Student },
    });

    let totalMinted = 0;

    for (const student of students) {
      const count = await this.voucherRepository.count({
        where: { userId: student.id },
      });

      if (count < 10) {
        const toMint = 10 - count;
        this.logger.log(`📥 Minting ${toMint} vouchers for student ${student.username} (current: ${count})`);
        await this.generateVouchersForUser(student.id, toMint);
        totalMinted += toMint;
      }
    }

    if (totalMinted > 0) {
      this.logger.log(`✅ [Cron] Finished. Total vouchers minted: ${totalMinted}`);
    } else {
      this.logger.debug('[Cron] All students have sufficient vouchers.');
    }
  }
}
