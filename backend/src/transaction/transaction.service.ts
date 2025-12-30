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
    return this.transactionRepository.find({
      where: [
        { fromUserId: userId },
        { toUserId: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}

