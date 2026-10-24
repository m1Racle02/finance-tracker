import React, { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction, TransactionType } from '../types';
import TransactionForm from './TransactionForm';

interface Props {
  filters?: {
    type?: TransactionType;
    categoryId?: string;
  };
}

const TransactionList: React.FC<Props> = ({ filters }) => {
  const { deleteTransaction, getFilteredTransactions, categories } = useDataStore();
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const limit = 10;

  const { transactions, total } = getFilteredTransactions({
    ...filters,
    page,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  const getCategory = (categoryId: string) => categories.find((c) => c.id === categoryId);

  const foundTransaction = editingId ? transactions.find((t) => t.id === editingId) : null;
  const editingTransaction = foundTransaction ? {
    id: foundTransaction.id,
    type: foundTransaction.type,
    amount: foundTransaction.amount,
    categoryId: foundTransaction.categoryId,
    date: foundTransaction.date,
    description: foundTransaction.description || '',
    currency: foundTransaction.currency,
  } : null;

  if (editingTransaction) {
    return (
      <TransactionForm
        editTransaction={editingTransaction}
        onSuccess={() => setEditingId(null)}
        onCancel={() => setEditingId(null)}
      />
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <span className="text-4xl block mb-2">📭</span>
        <p>Транзакции не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((t: Transaction) => {
        const cat = getCategory(t.categoryId);
        return (
          <div
            key={t.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{cat?.icon || '❓'}</span>
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {cat?.name || 'Неизвестно'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(t.date)}
                  {t.description && ` • ${t.description}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`font-bold text-lg ${
                  t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, t.currency)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditingId(t.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {page} из {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
          >
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
