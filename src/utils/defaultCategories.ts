import { Category } from '../types';

export const defaultCategories: Category[] = [
  // Expense categories
  { id: 'cat-food', name: 'Еда', type: 'expense', icon: '🍕' },
  { id: 'cat-transport', name: 'Транспорт', type: 'expense', icon: '🚗' },
  { id: 'cat-entertainment', name: 'Развлечения', type: 'expense', icon: '🎬' },
  { id: 'cat-education', name: 'Образование', type: 'expense', icon: '📚' },
  { id: 'cat-health', name: 'Здоровье', type: 'expense', icon: '💊' },
  { id: 'cat-clothes', name: 'Одежда', type: 'expense', icon: '👕' },
  { id: 'cat-home', name: 'Дом', type: 'expense', icon: '🏠' },
  { id: 'cat-other-expense', name: 'Другое', type: 'expense', icon: '📦' },
  // Income categories
  { id: 'cat-salary', name: 'Зарплата', type: 'income', icon: '💰' },
  { id: 'cat-freelance', name: 'Фриланс', type: 'income', icon: '💻' },
  { id: 'cat-investment', name: 'Инвестиции', type: 'income', icon: '📈' },
  { id: 'cat-gift', name: 'Подарок', type: 'income', icon: '🎁' },
  { id: 'cat-other-income', name: 'Другое', type: 'income', icon: '💵' },
];
