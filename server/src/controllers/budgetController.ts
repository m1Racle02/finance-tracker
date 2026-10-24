import { Response } from 'express';
import prisma from '../services/prisma';
import { budgetSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export const getBudgets = async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: req.userId },
      include: { category: true },
    });

    // Calculate spent for each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const spent = await prisma.transaction.aggregate({
          where: {
            userId: req.userId!,
            categoryId: budget.categoryId,
            type: 'expense',
            date: { gte: monthStart },
          },
          _sum: { amount: true },
        });

        return {
          ...budget,
          spent: spent._sum.amount || 0,
          percentage: budget.limit > 0 ? ((spent._sum.amount || 0) / budget.limit) * 100 : 0,
        };
      })
    );

    res.json(budgetsWithProgress);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const setBudget = async (req: AuthRequest, res: Response) => {
  try {
    const data = budgetSchema.parse(req.body);

    // Check if budget already exists for this category
    const existing = await prisma.budget.findFirst({
      where: { userId: req.userId!, categoryId: data.categoryId },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { limit: data.limit, period: data.period },
        include: { category: true },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId: req.userId!,
          categoryId: data.categoryId,
          limit: data.limit,
          period: data.period,
        },
        include: { category: true },
      });
    }

    res.json(budget);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deleteBudget = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const budget = await prisma.budget.findUnique({ where: { id: parseInt(id) } });
    if (!budget || budget.userId !== req.userId) {
      return res.status(404).json({ error: 'Бюджет не найден' });
    }

    await prisma.budget.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Бюджет удалён' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
