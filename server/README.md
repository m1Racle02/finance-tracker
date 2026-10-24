# Finance Tracker - Backend API

## Node.js + Express + TypeScript + Prisma + PostgreSQL

### Установка и запуск

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### API Endpoints

#### Auth
- POST /api/auth/register - Регистрация
- POST /api/auth/login - Вход
- GET /api/auth/me - Текущий пользователь

#### Transactions
- GET /api/transactions - Список транзакций
- POST /api/transactions - Создать транзакцию
- PUT /api/transactions/:id - Обновить
- DELETE /api/transactions/:id - Удалить

#### Categories
- GET /api/categories - Список категорий
- POST /api/categories - Создать категорию
- DELETE /api/categories/:id - Удалить

#### Budgets
- GET /api/budgets - Список бюджетов
- POST /api/budgets - Установить бюджет
- DELETE /api/budgets/:id - Удалить
