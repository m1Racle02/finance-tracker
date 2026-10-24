import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../services/prisma';
import { generateToken } from '../utils/jwt';
import { registerSchema, loginSchema } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    // Create default categories for user
    const defaultCategories = [
      { name: 'Еда', type: 'expense', icon: '🍕' },
      { name: 'Транспорт', type: 'expense', icon: '🚗' },
      { name: 'Развлечения', type: 'expense', icon: '🎬' },
      { name: 'Образование', type: 'expense', icon: '📚' },
      { name: 'Здоровье', type: 'expense', icon: '💊' },
      { name: 'Одежда', type: 'expense', icon: '👕' },
      { name: 'Дом', type: 'expense', icon: '🏠' },
      { name: 'Другое', type: 'expense', icon: '📦' },
      { name: 'Зарплата', type: 'income', icon: '💰' },
      { name: 'Фриланс', type: 'income', icon: '💻' },
      { name: 'Инвестиции', type: 'income', icon: '📈' },
      { name: 'Подарок', type: 'income', icon: '🎁' },
      { name: 'Другое', type: 'income', icon: '💵' },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((cat) => ({ ...cat, userId: user.id })),
    });

    const token = generateToken(user.id);

    res.status(201).json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = generateToken(user.id);

    res.json({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
      token,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};
