import { Response } from 'express';
import prisma from '../services/prisma';
import { categorySchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { userId: req.userId },
          { userId: null },
        ],
      },
      orderBy: { name: 'asc' },
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const data = categorySchema.parse(req.body);

    const category = await prisma.category.create({
      data: {
        ...data,
        userId: req.userId!,
      },
    });

    res.status(201).json(category);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category || category.userId !== req.userId) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({ where: { categoryId: parseInt(id) } });
    if (transactionCount > 0) {
      return res.status(400).json({ error: 'Нельзя удалить категорию с транзакциями' });
    }

    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
