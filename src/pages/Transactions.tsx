import React, { useState } from 'react';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { TransactionType } from '../types';
import { exportToCSV, downloadCSV, formatDate } from '../utils/formatters';

const Transactions: React.FC = () => {
  const { categories } = useDataStore();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleExport = () => {
    const { transactions } = useDataStore.getState().getFilteredTransactions({
      type: filterType || undefined,
      categoryId: filterCategory || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

    const csvData = transactions.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId);
      return {
        date: t.date,
        type: t.type,
        amount: t.amount,
        category: cat?.name || 'Неизвестно',
        description: t.description || '',
        currency: t.currency,
      };
    });

    const csv = exportToCSV(csvData);
    downloadCSV(csv, `transactions_${formatDate(new Date().toISOString())}.csv`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">💳 Транзакции</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            📥 Экспорт CSV
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            {showForm ? '✕ Закрыть' : '➕ Добавить'}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="animate-in fade-in">
          <TransactionForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Тип</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
            >
              <option value="">Все</option>
              <option value="income">Доходы</option>
              <option value="expense">Расходы</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Категория</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
            >
              <option value="">Все категории</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Дата от</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Дата до</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <TransactionList
        filters={{
          type: filterType || undefined,
          categoryId: filterCategory || undefined,
        }}
      />
    </div>
  );
};

export default Transactions;
