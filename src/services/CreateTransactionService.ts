// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';
import AppError from '../errors/AppError';

export interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    type,
    value,
    title,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const balance = await transactionsRepository.getBalance();
    const outcomeIsMoreThanBalance =
      type === 'outcome' && value > balance.total;

    if (outcomeIsMoreThanBalance) {
      throw new AppError('You no have balance for this transaction');
    }

    if (!category) {
      throw new AppError(
        'The category name is required to create a transaction',
      );
    }

    const createCategory = new CreateCategoryService();
    const createdCategory = await createCategory.execute({
      title: category,
    });

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: createdCategory.id,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
