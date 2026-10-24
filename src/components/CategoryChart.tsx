import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useDataStore } from '../store/dataStore';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart: React.FC = () => {
  const { getExpensesByCategory } = useDataStore();
  const data = getExpensesByCategory();

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Расходы по категориям</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl block mb-2">📈</span>
          <p>Добавьте расходы для отображения графика</p>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => `${d.icon} ${d.name}`),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((d) => d.color),
        borderColor: data.map((d) => d.color),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: { size: 12 },
          color: '#6b7280',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${value.toLocaleString('ru-RU')} ₽ (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">📊 Расходы по категориям</h3>
      <div className="max-w-xs mx-auto">
        <Pie data={chartData} options={options} />
      </div>
    </div>
  );
};

export default CategoryChart;
