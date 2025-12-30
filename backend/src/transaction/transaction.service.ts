import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType } from './entities/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async createTransaction(
    fromUserId: number | null,
    toUserId: number | null,
    amount: number,
    type: TransactionType,
    description?: string,
  ): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      fromUserId,
      toUserId,
      amount,
      type,
      description,
    });
    return this.transactionRepository.save(transaction);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    // Validate userId
    const validUserId = typeof userId === 'number' ? userId : parseInt(String(userId), 10);
    if (isNaN(validUserId) || validUserId <= 0) {
      console.error('getTransactionsByUserId - Invalid userId:', userId, typeof userId);
      throw new Error(`Invalid user ID: ${userId}`);
    }
    console.log('getTransactionsByUserId - querying with userId:', validUserId);
    try {
      const transactions = await this.transactionRepository.find({
        where: [
          { fromUserId: validUserId },
          { toUserId: validUserId },
        ],
        order: { createdAt: 'DESC' },
      });
      console.log('getTransactionsByUserId - found transactions:', transactions.length);
      return transactions;
    } catch (error) {
      console.error('getTransactionsByUserId - Query error:', error);
      console.error('getTransactionsByUserId - userId used in query:', validUserId, typeof validUserId);
      throw error;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}

