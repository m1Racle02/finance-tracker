import React, { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import BudgetProgress from '../components/BudgetProgress';
import { formatCurrency } from '../utils/formatters';

const Budgets: React.FC = () => {
  const { categories, setBudget, getBudgetProgress } = useDataStore();
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [success, setSuccess] = useState('');

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limit || !user) return;

    setBudget({
      userId: user.id,
      categoryId: selectedCategory,
      limit: parseFloat(limit),
      period: 'monthly',
    });

    setSelectedCategory('');
    setLimit('');
    setSuccess('Бюджет установлен!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🎯 Бюджетирование</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Set budget form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Установить бюджет</h3>
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите категорию</option>
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Месячный лимит (₽)</label>
              <input
                type="number"
                min="1"
                step="100"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="50000"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              💾 Установить бюджет
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">💡 Подсказка</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Зелёный — потрачено менее 70% бюджета</li>
              <li>• Жёлтый — потрачено 70-90% бюджета</li>
              <li>• Красный — потрачено более 90% бюджета</li>
            </ul>
          </div>
        </div>

        {/* Budget progress */}
        <BudgetProgress />
      </div>

      {/* Category overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Обзор расходов по категориям (этот месяц)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((cat) => {
            const progress = getBudgetProgress(cat.id);
            return (
              <div key={cat.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{cat.name}</span>
                </div>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {formatCurrency(progress.spent)}
                </p>
                {progress.limit > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    из {formatCurrency(progress.limit)} ({progress.percentage.toFixed(0)}%)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Budgets;
