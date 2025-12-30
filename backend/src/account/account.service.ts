import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async createAccount(userId: number, initialBalance: number = 10000): Promise<Account> {
    const account = this.accountRepository.create({
      userId,
      balance: initialBalance,
      currency: 'USD',
    });
    return this.accountRepository.save(account);
  }

  async getAccountByUserId(userId: number): Promise<Account> {
    console.log('getAccountByUserId - userId:', userId, typeof userId);
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    console.log('getAccountByUserId - validUserId:', validUserId, typeof validUserId);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getAccountByUserId - Invalid userId:', userId, 'validUserId:', validUserId);
      throw new NotFoundException(`Invalid user ID: ${userId}`);
    }
    
    console.log('getAccountByUserId - querying with userId:', validUserId);
    const account = await this.accountRepository.findOne({
      where: { userId: validUserId },
    });
    if (!account) {
      throw new NotFoundException(`Account not found for user ${validUserId}`);
    }
    return account;
  }

  async updateBalance(userId: number, newBalance: number): Promise<Account> {
    const account = await this.getAccountByUserId(userId);
    account.balance = newBalance;
    return this.accountRepository.save(account);
  }

  async adjustBalance(userId: number, amount: number): Promise<Account> {
    const account = await this.getAccountByUserId(userId);
    const currentBalance = parseFloat(account.balance.toString());
    const newBalance = currentBalance + amount;
    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }
    account.balance = newBalance;
    return this.accountRepository.save(account);
  }

  async getBalance(userId: number): Promise<number> {
    const account = await this.getAccountByUserId(userId);
    return parseFloat(account.balance.toString());
  }
}

