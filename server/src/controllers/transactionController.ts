import { Response } from 'express';
import prisma from '../services/prisma';
import { transactionSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const { type, categoryId, dateFrom, dateTo, page = '1', limit = '10' } = req.query;
    
    const where: any = { userId: req.userId };
    
    if (type) where.type = type;
    if (categoryId) where.categoryId = parseInt(categoryId as string);
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) where.date.gte = new Date(dateFrom as string);
      if (dateTo) where.date.lte = new Date(dateTo as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({ transactions, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const data = transactionSchema.parse(req.body);

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        userId: req.userId!,
        date: data.date ? new Date(data.date) : new Date(),
      },
      include: { category: true },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = transactionSchema.partial().parse(req.body);

    const transaction = await prisma.transaction.findUnique({ where: { id: parseInt(id) } });
    if (!transaction || transaction.userId !== req.userId) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }

    const updated = await prisma.transaction.update({
      where: { id: parseInt(id) },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
      include: { category: true },
    });

    res.json(updated);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({ where: { id: parseInt(id) } });
    if (!transaction || transaction.userId !== req.userId) {
      return res.status(404).json({ error: 'Транзакция не найдена' });
    }

    await prisma.transaction.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Транзакция удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
