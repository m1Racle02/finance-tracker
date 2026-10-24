import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Сумма должна быть положительной'),
  categoryId: z.number().int().positive(),
  currency: z.string().default('RUB'),
  description: z.string().optional(),
  date: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
});

export const budgetSchema = z.object({
  categoryId: z.number().int().positive(),
  limit: z.number().positive('Лимит должен быть положительным'),
  period: z.string().default('monthly'),
});
