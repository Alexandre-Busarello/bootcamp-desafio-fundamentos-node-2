import fs from 'fs';
import path from 'path';
import getStream from 'get-stream';
import parse from 'csv-parse';

import CreateTransactionService from './CreateTransactionService';

import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

export interface Request {
  filename: string;
}

type CsvType = Array<Array<string>>;
type RowType = Array<string>;

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const tmpFolder = path.resolve(__dirname, '..', '..', 'tmp');
    const parseStream = parse({ delimiter: ',' });
    const csvFilePath = path.join(tmpFolder, filename);
    const data = await getStream.array(
      fs.createReadStream(csvFilePath).pipe(parseStream),
    );

    if (data) {
      const createTransaction = new CreateTransactionService();
      const rows = data as CsvType;
      const incomeTransactions = await Promise.all(
        rows.slice(1).map((row: RowType) => {
          if (row[1].trim() !== 'income') return null;
          return createTransaction.execute({
            title: row[0],
            type: row[1].trim() as 'income' | 'outcome',
            value: Number(row[2]),
            category: row[3].trim(),
          });
        }),
      );
      const outcomeTransactions = await Promise.all(
        rows.slice(1).map((row: RowType) => {
          if (row[1].trim() !== 'outcome') return null;
          return createTransaction.execute({
            title: row[0],
            type: row[1].trim() as 'income' | 'outcome',
            value: Number(row[2]),
            category: row[3].trim(),
          });
        }),
      );

      const transactions = incomeTransactions.concat(outcomeTransactions);

      const fileExists = await fs.promises.stat(csvFilePath);

      if (fileExists) {
        await fs.promises.unlink(csvFilePath);
      }

      return transactions.filter(t => !!t) as Transaction[];
    }

    throw new AppError('Csv file not found');
  }
}

export default ImportTransactionsService;
