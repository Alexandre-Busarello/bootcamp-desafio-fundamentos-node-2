// import AppError from '../errors/AppError';
import { getCustomRepository, DeleteResult } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';

export interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<DeleteResult> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    return transactionsRepository.delete(id);
  }
}

export default DeleteTransactionService;
