import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler } from 'chart.js';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, formatDateShort } from '../utils/formatters';
import CategoryChart from '../components/CategoryChart';
import BudgetProgress from '../components/BudgetProgress';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const Dashboard: React.FC = () => {
  const { getStats, getBalanceOverTime, getTopCategories } = useDataStore();
  const stats = getStats();
  const balanceData = getBalanceOverTime();
  const topCategories = getTopCategories(5);

  const lineChartData = {
    labels: balanceData.slice(-14).map((d) => formatDateShort(d.date)),
    datasets: [
      {
        label: 'Баланс',
        data: balanceData.slice(-14).map((d) => d.balance),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#2563eb',
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => formatCurrency(context.parsed.y),
        },
      },
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (value: any) => `${(value / 1000).toFixed(0)}k`,
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">📊 Дашборд</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Баланс</p>
              <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(stats.balance)}
              </p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Доходы</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Расходы</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <span className="text-3xl">📉</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ср. расход/день</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {formatCurrency(stats.avgDaily)}
              </p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📈 Динамика баланса</h3>
          {balanceData.length > 0 ? (
            <div className="h-64">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-4xl block mb-2">📊</span>
              <p>Добавьте транзакции для графика</p>
            </div>
          )}
        </div>

        {/* Category chart */}
        <CategoryChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">🏆 Топ-5 категорий расходов</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((cat, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                  </div>
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Нет данных</p>
            </div>
          )}
        </div>

        {/* Budgets */}
        <BudgetProgress />
      </div>
    </div>
  );
};

export default Dashboard;
