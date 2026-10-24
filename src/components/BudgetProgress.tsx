import React from 'react';
import { useDataStore } from '../store/dataStore';
import { formatCurrency } from '../utils/formatters';

const BudgetProgress: React.FC = () => {
  const { budgets, categories, getBudgetProgress, deleteBudget } = useDataStore();

  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🎯 Бюджеты</h3>
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          <p>Бюджеты не установлены</p>
        </div>
      </div>
    );
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 dark:bg-red-900/20';
    if (percentage >= 70) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-green-100 dark:bg-green-900/20';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🎯 Бюджеты на месяц</h3>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const progress = getBudgetProgress(budget.categoryId);
          const category = categories.find((c) => c.id === budget.categoryId);
          const percentage = Math.min(progress.percentage, 100);

          return (
            <div key={budget.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category?.icon} {category?.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(progress.spent)} / {formatCurrency(progress.limit)}
                  </span>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Удалить бюджет"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className={`h-3 rounded-full ${getProgressBg(progress.percentage)} overflow-hidden`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(progress.percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${
                  progress.percentage >= 90 ? 'text-red-600 dark:text-red-400' :
                  progress.percentage >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {progress.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetProgress;
