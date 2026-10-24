export const formatCurrency = (amount: number, currency: string = 'RUB'): string => {
  const symbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  };
  const symbol = symbols[currency] || currency;
  return `${amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatDateShort = (date: string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
  });
};

export const getMonthName = (month: number): string => {
  const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  return months[month];
};

export const exportToCSV = (transactions: Array<{ date: string; type: string; amount: number; category: string; description: string; currency: string }>): string => {
  const headers = ['Дата', 'Тип', 'Сумма', 'Категория', 'Описание', 'Валюта'];
  const rows = transactions.map(t => [
    formatDate(t.date),
    t.type === 'income' ? 'Доход' : 'Расход',
    t.amount.toString(),
    t.category,
    t.description || '',
    t.currency,
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  return csv;
};

export const downloadCSV = (csv: string, filename: string): void => {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
